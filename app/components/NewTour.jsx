'use client'
import { getExistingTour, generateTourResponse, createNewTour, fetchUserTokensById, subtractTokens } from "@/utils/action"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import toast from 'react-hot-toast'
import TourInfo from "./TourInfo"
import { useAuth } from "@clerk/nextjs"

const NewTour = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  const { mutate, isPending, data: tour } = useMutation({
    mutationFn: async (destination) => {

      const existingTour = await getExistingTour(destination)
      if (existingTour) return existingTour

      const currentTokens = await fetchUserTokensById(userId)
      if (currentTokens < 300) {
        toast.error('トークンが少なくなっています...')
        return
      }

      const newTour = await generateTourResponse(destination)
      if (!newTour) {
        toast.error('お探しの条件にマッチしませんでした...')
        return null
      }

      const response = await createNewTour(newTour.tour)
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      const newTokens = await subtractTokens(userId, newTour.tokens)
      toast.success(`残り${newTokens} トークンです`)
      return newTour.tour
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const destination = Object.fromEntries(formData.entries())
    console.log(destination);
    // const query = {
    //   role: 'user',
    //   content: text
    // }
    mutate(destination)
    // setMessages((prev) => [...prev, query])
    // setText('')
  }

  if (isPending) {
    return <span className="loading loading-lg"></span>
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <h2 className="mb-4">旅の目的地を選んでください</h2>
        <div className="join w-full">
          <input type="text" placeholder="都道府県"
            className="input input-bordered join-item w-full"
            name='country' required
          />

          <input type="text" placeholder="市町村"
            className="input input-bordered join-item w-full"
            name='city' required
          />

          <button className="btn btn-primary join-item" type="submit">
            ツアーを作成する
          </button>
        </div>
      </form>

      <div className="mt-16">
        {tour ? <TourInfo tour={tour} /> : null}
      </div>
    </>
  )
}

export default NewTour