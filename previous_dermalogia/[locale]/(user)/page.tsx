import Image from "next/image";
import Card from "@/components/Card";
import Map from "../../../components/SlMap"
import LocationList from "../../../components/LocationList";
import initTranslations from '../../i18n';
export default async function Home() {
  return (
    <div className="">
   <LocationList />
    </div>
  );
}




