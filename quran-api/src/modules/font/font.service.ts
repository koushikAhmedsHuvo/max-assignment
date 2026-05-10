import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FontDefaultsDto,
  FontDto,
  FontSettingsDto,
} from './dto/font-settings.dto';

const availableFonts: FontDto[] = [
  {
    id: 'uthmani',
    name: 'KFGQ Uthmanic Hafs',
    cssFamily: 'KFGQPC Uthmanic Script HAFS',
    cdnUrl:
      'https://fonts.qurancomplex.gov.sa/wp-content/uploads/2021/08/KFGQPC-HAFS-Uthmanic-Script.woff2',
  },
  {
    id: 'amiri',
    name: 'Amiri Quran',
    cssFamily: 'Amiri',
    cdnUrl:
      'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.woff2',
  },
  {
    id: 'scheherazade',
    name: 'Scheherazade New',
    cssFamily: 'Scheherazade New',
    cdnUrl:
      'https://fonts.gstatic.com/s/scheherazadenew/v17/4UaZrFhTvxVnHDvUkUiHg8jQkzM.woff2',
  },
];

const defaultSettings: FontDefaultsDto = {
  arabicFontId: 'uthmani',
  arabicFontSize: 28,
  translationFontSize: 16,
};

@Injectable()
export class FontService {
  /**
   * Gets all available fonts and default display settings.
   */
  getFontSettings(): FontSettingsDto {
    return {
      fonts: availableFonts,
      defaults: defaultSettings,
    };
  }

  /**
   * Gets one font by its stable font id.
   */
  getFontById(id: string): FontDto {
    const font = availableFonts.find((item) => item.id === id);

    if (!font) {
      throw new NotFoundException('Font not found');
    }

    return font;
  }
}
