import { typetranslations } from "@prisma/client"
import { cookies } from "next/headers";
import BibleIA from "../components/bibleIA/bible"
type Translation = {
    data: {
        type_translations: typetranslations
    }
}

export default async function BibleIAcomponents() {
    const cookieHeader = await cookies();

    const typeTranslations = await fetch(`${process.env.NEXT_PUBLIC_URL}api/revalidates/typeTranslation`, {
        headers: {
            cookie: cookieHeader.toString(),  // Envia os cookies como string no cabeçalho
        },
        next: { tags: ['type-translation'] },
    }).then(async res => {
        if (!res.ok) {
            console.error(res.statusText)
            return
        }
        return await res.json() as Promise<Translation>;
    });

    return <div className=" ">
        <BibleIA typeTranslations={typeTranslations}/>
    </div>
}