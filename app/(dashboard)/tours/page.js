import ToursPage from "@/app/components/ToursPage"
import { getALLTours } from "@/utils/action"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

const AllToursPage = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['tours', ''],
    queryFn: () => getALLTours()
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ToursPage />
    </HydrationBoundary>
  )
}

export default AllToursPage