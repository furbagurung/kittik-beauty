type Props = {
  status: string;
};

export default function OrderStatusBadge({ status }: Props) {
  let styles = "bg-gray-100 text-gray-600";

  if (status === "Paid") {
    styles = "bg-green-100 text-green-700";
  }

  if (status === "Pending") {
    styles = "bg-yellow-100 text-yellow-700";
  }

  if (status === "Processing") {
    styles = "bg-blue-100 text-blue-700";
  }

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
