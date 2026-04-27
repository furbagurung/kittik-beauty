"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export default function BannerPage() {
  const [banners, setBanners] = useState([]);
  const [image, setImage] = useState("");

  async function load() {
    const res = await fetch("/api/banners");
    const data = await res.json();
    setBanners(data.data);
  }

  async function create() {
    await fetch("/api/banners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    setImage("");
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Hero Banners</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <Button onClick={create}>Add</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {banners.map((b: any) => (
          <div key={b.id} className="border p-2 rounded">
            <img src={b.image} className="w-full h-40 object-cover rounded" />
            <Button
              variant="destructive"
              onClick={() => remove(b.id)}
              className="mt-2 w-full"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
