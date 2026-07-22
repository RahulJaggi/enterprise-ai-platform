import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { DocumentUploadResponseDto } from './dto/document-upload-response.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  async extractTextFromPdf(file: Express.Multer.File): Promise<DocumentUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No PDF file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        `Invalid file format: ${file.mimetype}. Only PDF documents (.pdf) are allowed.`,
      );
    }

    this.logger.log(
      `Processing PDF text extraction [Filename: ${file.originalname}, Size: ${file.size} bytes]`,
    );

    try {
      const parsedPdf = await pdfParse(file.buffer);
      const text = parsedPdf.text ? parsedPdf.text.trim() : '';
      const pageCount = parsedPdf.numpages || 1;
      const characterCount = text.length;

      this.logger.log(
        `PDF extraction complete [Filename: ${file.originalname}, Pages: ${pageCount}, CharacterCount: ${characterCount}]`,
      );

      return {
        filename: file.originalname,
        pageCount,
        characterCount,
        text,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'PDF parsing error';
      this.logger.error(`Failed to parse PDF [Filename: ${file.originalname}]: ${errorMessage}`);
      throw new BadRequestException(`Failed to extract text from PDF document: ${errorMessage}`);
    }
  }
}
