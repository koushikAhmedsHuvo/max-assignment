import { notFound } from "next/navigation";
import { SurahReaderClient } from "@/src/components/SurahReaderClient";
import { getSurahList, getSurahWithTranslation } from "@/src/lib/api";

interface SurahPageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function SurahPage({ params }: SurahPageProps) {
  const surahId = Number(params.id);
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  const [surahList, surahData] = await Promise.all([
    getSurahList(),
    getSurahWithTranslation(surahId),
  ]);

  return (
    <SurahReaderClient
      surahs={surahList}
      surah={surahData.surah}
      ayahs={surahData.ayahs}
    />
  );
}
