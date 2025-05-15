import Share from "../components/share";


export default async function ShareWrapper({ params }: { params: Promise<{ id: string }> }) {
    const {id} = await params
    return <div className=' bg-[#181818] h-dvh'>
        <Share id={id}/>
    </div>
}