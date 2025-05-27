import { typetranslations } from "@prisma/client"
import BibleIA from "./components/bibleIA/bible"


export default async function BibleIAcomponents() {

    return <div className="flex justify-center items-center w-full ">
        <BibleIA />
    </div>
}