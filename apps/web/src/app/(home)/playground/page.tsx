import React from "react";
import HomeFileUpload from "@/components/file-upload/home-file-upload";

function Page() {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-3 lg:gap-x-4 gap-4 gap-x-0 my-12 ">
      <div className="col-span-full mb-4">
        <h2 id="playground-demo" className=" font-semibold text-2xl mb-1">
          Morpics Live Playground
        </h2>
        <p className=" text-muted-foreground">
          Upload your image and get realtime results
        </p>
      </div>
      <HomeFileUpload />
    </section>
  );
}

export default Page;
