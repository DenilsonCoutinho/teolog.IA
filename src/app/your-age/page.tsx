// app/your-age/page.tsx
import { redirect, RedirectType } from "next/navigation";
import { auth } from "../../../auth";
import YourAge from "./yourAge";
import IsNewUser from "../../../service/isNewUser";

export default async function YourAgePage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/", RedirectType.replace);
    }

    const isNewUser = await IsNewUser(session.user.id);

    if (!isNewUser?.isNewUser) {
        redirect("/bibleIA");
    }

    return <YourAge />;
}
