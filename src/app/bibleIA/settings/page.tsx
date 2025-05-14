
import { typetheology, Typetheology, typetranslations } from "@prisma/client"
import Settings from "./settings"
import { cookies } from "next/headers"
import { Suspense } from "react"
import SettingsWrapper from "./settingsWrapper"
type Theology = {
    data: {
        type_theology: typetheology
    }
}

type Translation = {
    data: {
        type_translations: typetranslations
    }
}

export default async function SettingsServerSide() {
    const cookieHeader = await cookies();

    // Realiza a requisição para buscar o tipo de teologia
    const typetheology = await fetch(`${process.env.NEXT_PUBLIC_URL}api/revalidates/typeTheology`, {
        headers: {
            cookie: cookieHeader.toString(),  // Envia os cookies como string no cabeçalho
        },
        next: { tags: ['type-theology'] },
    }).then(async res => {
        if (!res.ok) {
            console.error(res.statusText)
            return 
        }
        return await res.json() as Promise<Theology>;
    });


     const typeTranslations= await fetch(`${process.env.NEXT_PUBLIC_URL}api/revalidates/typeTranslation`, {
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

   
    return (
            <SettingsWrapper typetranslations={typeTranslations} typetheology={typetheology} />
    )
}