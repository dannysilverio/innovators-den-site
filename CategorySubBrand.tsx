import { getListCategoriesQueryKey, useListCategories } from "@workspace/api-client-react";

export default function CategorySubBrand({ topic }: { topic: string }) {
  const { data } = useListCategories({ query: { queryKey: getListCategoriesQueryKey(), staleTime: 30_000, refetchOnWindowFocus: true } });
  const label = data?.find(category => category.name === topic || category.slug === topic)?.subBrand;
  return label ? <span className="block text-xs font-semibold normal-case tracking-normal text-white/60 mt-1">{label}</span> : null;
}
