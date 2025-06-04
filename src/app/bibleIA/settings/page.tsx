
import { typetheology, Typetheology, typetranslations } from "@prisma/client"
import Settings from "./settings"
import { cookies } from "next/headers"
import { Suspense } from "react"
// import SettingsWrapper from "./settingsWrapper"
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
   
    return (
            <Settings   />
    )
}