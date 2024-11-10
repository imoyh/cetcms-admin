import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { MediaService } from 'src/api/media/media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':uuid/:fileName.:fileExt')
  async findOne(@Param('uuid') uuid: string, @Param('fileName') fileName: string, @Param('fileExt') fileExt: string) {
    const media = await this.mediaService.findOne(uuid);
    if (!media || media.fileName !== fileName || media.fileExt !== fileExt) {
      throw new NotFoundException(`Media #${uuid}/${fileName}.${fileExt} not found`);
    }
    return `This action returns a #${uuid}/${fileName}.${fileExt} media`;
  }
}
