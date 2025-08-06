import ClassClientPage from "./ClassClientPage";

export default function ClassPage({
  params,
}: {
  params: { id: string };
}) {
  return <ClassClientPage id={params.id} />;
}