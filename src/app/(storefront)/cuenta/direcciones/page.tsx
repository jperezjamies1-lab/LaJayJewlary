import { redirect } from "next/navigation";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import AddressManager from "@/components/storefront/AddressManager";
import { getCustomerSession } from "@/lib/auth/customer";

export default async function AddressesPage() {
  const customer = await getCustomerSession();
  if (!customer) redirect("/cuenta/iniciar-sesion");

  return (
    <>
      <Header locale="es" />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-display text-3xl text-ivory mb-8">Mis Direcciones</h1>
        <AddressManager />
      </div>
      <Footer locale="es" />
    </>
  );
}
