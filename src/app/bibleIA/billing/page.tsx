import Billing from "./billing";
import getDataSubscriptionUser from "../../../../service/dataSubscription";
import getDataPriceUser from "../../../../service/dataPrice";

export default async function BillingServerSide() {
    const getDataSubscription = await getDataSubscriptionUser()
    const plainData = getDataSubscription
    ? JSON.parse(JSON.stringify(getDataSubscription))
    : undefined

    const getDataPrice = await getDataPriceUser()
    const plainPriceData = getDataPrice
    ? JSON.parse(JSON.stringify(getDataPrice))
    : undefined

    
    return <>
        <Billing dataBilling={plainData} dataPriceBilling={plainPriceData} />
    </>
}
