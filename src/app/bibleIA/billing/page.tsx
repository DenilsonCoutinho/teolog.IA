import Billing from "./billing";
import getDataSubscriptionUser from "../../../../service/dataSubscription";
import billing_data from "../../../../service/billing_data";

export default async function BillingServerSide() {
    const billingData = await billing_data()

    return <>
        <Billing billingData={billingData}/>
    </>
}
