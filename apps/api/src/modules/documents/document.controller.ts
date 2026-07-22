import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { DocumentUploadResponseDto } from './dto/document-upload-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload PDF Document & Extract Raw Text',
    description:
      'Accepts a PDF document file upload (multipart/form-data), extracts its raw text contents and page count, and returns document metadata.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload and extract text from',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'PDF document uploaded and text extracted successfully',
    type: DocumentUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing PDF file',
  })
  async uploadDocument(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponseEnvelope<DocumentUploadResponseDto>> {
    if (!file) {
      throw new BadRequestException('PDF file is required in multipart field "file"');
    }

    const data = await this.documentService.extractTextFromPdf(file);

    return {
      success: true,
      data,
      error: null,
      timestamp: new Date().toISOString(),
    };
  }
}
