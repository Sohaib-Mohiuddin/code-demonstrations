import { useEffect, useState } from "react";


export default function Home() {


  const [name, setName] = useState("Sample")


  useEffect(() => {
    console.log("hello this is a small change")
  }, []);


  return (
    <>
      <h1>Strapi Sample</h1>
      <h1>{name}</h1>
    </>
  );
}
