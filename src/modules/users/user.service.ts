import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import UserRepository from 'src/DB/repository/user.repository';
import {
  confirmPasswordDto,
  forgetPasswordDto,
  resetPasswordDto,
  SignInDto,
  SignUpDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './user.dto';
import { CompareHash, Hash } from 'src/common/utils/security/hash.security';
import { decrypt, encrypt } from 'src/common/utils/security/encrypt.security';
import { generateOtp, sendEmail } from 'src/common/utils/email/send.email';
import { email_Template } from 'src/common/utils/email/email.template';
import RedisService from 'src/common/service/redis.service';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { sendEmailOtp } from 'src/common/utils/email/email.otp';
import { Types } from 'mongoose';
import { S3Service } from 'src/common/service/s3.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userModel: UserRepository,
    private readonly redisService: RedisService,
    private readonly se3: S3Service,
    private jwtService: JwtService,
  ) {}
  async signUp(body: SignUpDto) {
    const { userName, email, cPassword, age, password, phone, gender } = body;
    const emailExist = await this.userModel.findOne({
      filter: { email },
    });
    if (emailExist) throw new ConflictException('Email Already Exist');
    const user = await this.userModel.create({
      userName,
      email,
      age,
      password: Hash({ plainText: password }),
      phone: encrypt(phone),
    });
    const otp = await generateOtp();
    await sendEmail({
      to: email,
      subject: 'Email Confirmation',
      html: email_Template(otp),
    });
    await this.redisService.setValue({
      key: `otp::${email}`,
      value: Hash({ plainText: `${otp}` }),
      ttl: 60 * 2,
    });
    await this.redisService.setValue({
      key: `max_otp::${email}`,
      value: '1',
      ttl: 60 * 5,
    });
    return user;
  }
  async signIn(body: SignInDto) {
    const { email, password } = body;
    const user = await this.userModel.findOne({
      filter: { email },
    });
    if (!user) throw new UnauthorizedException('Invalid Email');
    if (!CompareHash({ plainText: password, cipherText: user.password })) {
      throw new UnauthorizedException('Invalid Password');
    }
    const uuid = randomUUID();
    const token = this.jwtService.sign(
      { userId: user._id },
      {
        expiresIn: '1h',
        jwtid: uuid,
        secret: process.env.JWT_TOKEN!,
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user._id },
      {
        expiresIn: '1y',
        jwtid: uuid,
        secret: process.env.JWT_REFRESH_TOKEN!,
      },
    );
    return { token, refreshToken };
  }
  async refreshToken(refreshtoken: string) {
    if (!refreshtoken || typeof refreshtoken !== 'string') {
      throw new UnauthorizedException('Token Not Provided');
    }
    const decoded = this.jwtService.verify(refreshtoken, {
      secret: process.env.JWT_REFRESH_TOKEN!,
    });
    if (typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid Token');
    }
    const userId = decoded.userId;
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid Token Payload');
    }
    const user = await this.userModel.findOne({
      filter: { _id: userId },
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const token = this.jwtService.sign(
      { userId: user._id },
      { secret: process.env.JWT_TOKEN!, expiresIn: '1h' },
    );
    return { data: token };
  }
  async uploadProfilePic(body: any, user: any) {
    const { ContentType, fileName } = body;
    const { url, Key } = await this.se3.creatPreSignedUrl({
      fileName,
      ContentType,
      path: `users/${user._id}`,
    });

    await this.userModel.findOneAndUpdate({
      filter: { _id: user._id },
      update: { profilePic: Key },
    });
    return { data: { url, Key } };
  }
  async getUsers() {
    return await this.userModel.find();
  }
  async getProfile(user: any) {
    return { data: { ...user!.toObject(), phone: decrypt(user!.phone!) } };
  }
  async updateProfile(body: UpdateProfileDto, req: any) {
    let { userName, gender, phone, age } = body;
    if (phone) {
      phone = encrypt(phone);
    }
    let user = await this.userModel.findOneAndUpdate({
      filter: { _id: req.user!._id },
      update: { userName, gender, phone, age },
    });
    if (!user) {
      throw new NotFoundException('User Not Exist');
    }
    return user;
  }
  async updatePassword(body: UpdatePasswordDto, req: any) {
    let { oldPassword, newPassword } = body;
    if (
      !CompareHash({ plainText: oldPassword, cipherText: req.user!.password })
    ) {
      throw new BadRequestException('Invalid old Password');
    }
    const hashNewPassword = Hash({ plainText: newPassword });
    req.user!.password = hashNewPassword;
    await req.user!.save();
    return { data: 'Password Updated Succefully' };
  }
  async resendOtp(body: forgetPasswordDto) {
    const { email } = body;
    const user = await this.userModel.findOne({
      filter: { email },
    });
    if (!user) {
      throw new NotFoundException('User Not Exist Or Already Confirmed');
    }
    await sendEmailOtp(email, this.redisService);
    return { message: 'Otp Resend Succefully!' };
  }
  async forgetPassword(body: forgetPasswordDto) {
    const { email } = body;
    const user = await this.userModel.findOne({
      filter: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User Not Exist');
    }
    await sendEmailOtp(email, this.redisService);
    return { data: 'Otp Send Succefully' };
  }
  async confirmPassword(body: confirmPasswordDto) {
    const { email, otp } = body;
    const otpValue = await this.redisService.getValue(`otp::${email}`);
    if (!otpValue) {
      throw new BadRequestException('Invalid or Expired OTP');
    }

    if (!CompareHash({ plainText: otp, cipherText: otpValue })) {
      throw new BadRequestException('OTP is invalid');
    }
    await this.redisService.deleteKey(`otp::${email}`);
    await this.redisService.deleteKey(`max_otp::${email}`);
    await this.redisService.setValue({
      key: `verified_otp::${email}`,
      value: '1',
      ttl: 60 * 5,
    });
    return { message: 'Otp Is Valid' };
  }
  async resetPassword(body: resetPasswordDto) {
    const { email, newPassword, rePassword } = body;
    const isVerified = await this.redisService.getValue(
      `verified_otp::${email}`,
    );
    if (!isVerified) {
      throw new BadRequestException('Otp not verified');
    }
    const user = await this.userModel.findOneAndUpdate({
      filter: {
        email,
      },
      update: {
        password: Hash({ plainText: newPassword }),
      },
    });
    if (!user) {
      throw new NotFoundException('User Not Exist');
    }
    await this.redisService.deleteKey(`verified_otp::${email}`);
    await this.redisService.deleteKey(`confirm_tries::${email}`);
    return { message: 'Password Reset Succefully' };
  }

  async uploadFile(file: Express.Multer.File) {
    return {
      message: 'File Uploaded Successfully',
      path: file.path,
    };
  }
}
