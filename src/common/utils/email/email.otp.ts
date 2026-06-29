import {
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import RedisService from "../../service/redis.service.js";
import { Hash } from "../security/hash.security.js";
import { email_Template } from "./email.template.js";
import { generateOtp, sendEmail } from "./send.email.js";

export const sendEmailOtp = async (email: string,redisService: RedisService) => {
  const isBlocked = await redisService.ttl_redis(`block_otp::${email}`);

  if (isBlocked! > 0) {
    throw new BadRequestException(
      `Please Try Again After ${isBlocked} Second`
    );
  }

  const ttl = await redisService.ttl_redis(`otp::${email}`);

  if (!ttl) {
    throw new InternalServerErrorException("Can't Find TTL");
  }

  if (ttl > 0) {
    throw new BadRequestException(
      `You Can Resend Otp After ${ttl} Second`
    );
  }

  const maxOtp = await redisService.getValue(`max_otp::${email}`);

  if (maxOtp >= 3) {
    await redisService.setValue({
      key: `block_otp::${email}`,
      value: "1",
      ttl: 60 * 5,
    });

    throw new BadRequestException(
      "You Have Exceeded The Max Number Of Tries"
    );
  }

  const otp = await generateOtp();

  await sendEmail({
    to: email,
    subject: "Welcome To SocialMedia App",
    html: email_Template(otp),
  });

  await redisService.setValue({
    key: `otp::${email}`,
    value: Hash({ plainText: `${otp}` }),
    ttl: 60 * 2,
  });

  await redisService.incr(`max_otp::${email}`);
};