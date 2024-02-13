'use client'
import { getALLTours } from "@/utils/action"
import { useQuery } from "@tanstack/react-query"
import ToursList from "./ToursList"
import { useState } from "react"

const ToursPage = () => {
  const [searchValue, setSearchValue] = useState('')
  const { data, isPending } = useQuery({
    queryKey: ['tours', searchValue],
    queryFn: () => getALLTours(searchValue),
  })

  return (
    <>
      <form className="max-w-lg mb-12">
        <div className="join w-full">
          <input type="text" placeholder="都道府県または市町村を入力..."
            className="input input-bordered join-item w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)} required
          />
          <button className="btn btn-primary join-item" type="button"
            disabled={isPending} onClick={() => setSearchValue('')}>
              {isPending ? '検索中です...' : 'リセット'}
          </button>
        </div>
      </form>

      {isPending ? <span className="loading"></span> :
        <ToursList data={data} />
      }
    </>
  )
}

export default ToursPage