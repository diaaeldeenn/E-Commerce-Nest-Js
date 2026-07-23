import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  confirmPasswordDto,
  forgetPasswordDto,
  resetPasswordDto,
  SignInDto,
  SignUpDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multerCloud from '../../common/middleware/multer.cloud';
import { Store_Enum } from '../../common/enum/multer.enum';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { Roles } from '../../common/decorator/auth.decorator';
import { RoleEnum } from '../../common/enum/user.enum';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles(RoleEnum.admin)
  getUsers() {
    return this.userService.getUsers();
  }
  @Post('signup')
  signUp(@Body() body: SignUpDto): any {
    return this.userService.signUp(body);
  }
  @Post('signin')
  signIn(@Body() body: SignInDto): any {
    return this.userService.signIn(body);
  }
  @Get('profile')
  @UseGuards(AuthenticationGuard)
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user);
  }
  @Patch('updateProfile')
  @UseGuards(AuthenticationGuard)
  updateProfile(@Body() body: UpdateProfileDto, @Req() req: any): any {
    return this.userService.updateProfile(body, req.user);
  }
  @Patch('updatePassword')
  @UseGuards(AuthenticationGuard)
  updatePassword(@Body() body: UpdatePasswordDto, @Req() req: any): any {
    return this.userService.updatePassword(body, req.user);
  }
  @Post('refreshtoken')
  @UseGuards(AuthenticationGuard)
  refreshToken(@Headers('refreshtoken') refreshtoken: string) {
    return this.userService.refreshToken(refreshtoken);
  }
  @Post('resendOtp')
  @UseGuards(AuthenticationGuard)
  resendOtp(@Body() body: forgetPasswordDto): any {
    return this.userService.resendOtp(body);
  }
  @Patch('forgetPassword')
  @UseGuards(AuthenticationGuard)
  forgetPassword(@Body() body: forgetPasswordDto): any {
    return this.userService.forgetPassword(body);
  }
  @Post('confirmPassword')
  @UseGuards(AuthenticationGuard)
  confirmPassword(@Body() body: confirmPasswordDto): any {
    return this.userService.confirmPassword(body);
  }
  @Patch('resetPassword')
  @UseGuards(AuthenticationGuard)
  resetPassword(@Body() body: resetPasswordDto): any {
    return this.userService.resetPassword(body);
  }
  @Post('uploadProfilePic')
  @UseGuards(AuthenticationGuard)
  uploadProfilePic(@Body() body: any, @Req() req: any) {
    return this.userService.uploadProfilePic(body, req.user);
  }
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', multerCloud({ storeType: Store_Enum.memory })),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadFile(file);
  }
}
