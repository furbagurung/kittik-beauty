import PageHeader from "@/components/shared/PageHeader";
import { getProducts, type AdminApiProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of Stock",
      className:
        "inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700",
    };
  }

  if (stock <= 5) {
    return {
      label: "Low Stock",
      className:
        "inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700",
    };
  }

  return {
    label: "In Stock",
    className:
      "inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700",
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const products: AdminApiProduct[] = await getProducts();

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your products, stock, and status."
        action={
          <Link
            href="/products/new"
            className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Product
          </Link>
        }
      />
      {success === "created" ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Product created successfully.
        </div>
      ) : null}

      {success === "updated" ? (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Product updated successfully.
        </div>
      ) : null}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>

              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock ?? 0);

              return (
                <tr
                  key={product.id}
                  className="border-t transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-700">{product.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {product.stock ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={stockStatus.className}>
                      {stockStatus.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-black underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
