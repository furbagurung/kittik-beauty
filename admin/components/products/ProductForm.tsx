"use client";
import type { Product } from "@/types/product";
type ProductFormProps = {
  defaultValues?: Partial<Product>;
  onSubmit?: (values: Partial<Product>) => void;
};

export default function ProductForm({
  defaultValues,
  onSubmit,
}: ProductFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const values: Partial<Product> = {
      name: String(formData.get("name") || ""),
      category: String(formData.get("category") || ""),
      price: String(formData.get("price") || ""),
      stock: Number(formData.get("stock") || 0),
      status: formData.get("status") as Product["status"],
      image: String(formData.get("image") || ""),
      description: String(formData.get("description") || ""),
    };

    if (onSubmit) {
      onSubmit(values);
      return;
    }

    alert("Product saved (temporary frontend only)");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="Enter product name"
          defaultValue={defaultValues?.name ?? ""}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            required
            placeholder="Enter category"
            defaultValue={defaultValues?.category ?? ""}
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Price</label>
          <input
            name="price"
            type="number"
            placeholder="Enter price"
            defaultValue={defaultValues?.price ?? ""}
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            required
            min={0}
          />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="Enter stock quantity"
            defaultValue={defaultValues?.stock ?? ""}
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "Active"}
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
          >
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="text"
          name="image"
          placeholder="Paste image URL"
          defaultValue={defaultValues?.image ?? ""}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          placeholder="Write product description"
          rows={5}
          defaultValue={defaultValues?.description ?? ""}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Save Product
        </button>
      </div>
    </form>
  );
}
