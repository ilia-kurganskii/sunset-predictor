import {Injectable} from '@nestjs/common';
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

@Injectable()
export class AWSService {
    private s3Client = new S3Client({region: process.env.AWS_REGION});

    async getSignedUrlForFile(file: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_RECORDS_BUCKET,
            Key: file
        });
        return await getSignedUrl(this.s3Client, command, {expiresIn: 3600});
    }
}
