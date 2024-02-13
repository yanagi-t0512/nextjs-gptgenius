'use client'
import { generateChatResponse, fetchUserTokensById, subtractTokens } from "@/utils/action"
import { useAuth } from "@clerk/nextjs"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import toast from 'react-hot-toast'


const Chat = () => {
  const {userId} = useAuth()
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])

  const {mutate, isPending} = useMutation({
    mutationFn: async(query) => {
      const currentTokens = await fetchUserTokensById(userId)
      if (currentTokens < 100) {
        toast.error('トークンが少なくなっています...')
        return
      }
      const response = await generateChatResponse([...messages, query])
      console.log('responseとは', response)
      if(!response) {
        toast.error('何かエラーが発生しました...')
        return
      }
      setMessages((prev) => [...prev, response.message])
      const newTokens = await subtractTokens(userId, response.tokens)
      console.log('newTokens:', newTokens)
      toast.success(`残り${newTokens} トークンです`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // console.log(text);
    const query = {
      role: 'user',
      content: text
    }
    mutate(query)
    setMessages((prev) => [...prev, query])
    setText('')
  }

  // console.log('メッセージズ', messages)

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr,auto]">
      <div>
        {messages.map(({role, content}, index) => {
          const avatar = role == 'user' ? '👤' : '🤖';
          const bcg = role === 'user' ? 'bg-base-200' : 'bg-base-100'
          return (
            <div key={index} className={`${bcg} flex py-6 -mx-8 py8 text-xl leading-loose border-b border-base-300`}>
              <span className="mr-4">{avatar}</span>
              <p className="max-w-3xl">{content}</p>
            </div>
          )
        })}
        {isPending ? <span className="loading"></span> : null}
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl pt-12">
        <div className="join w-full">
          <input type="text" placeholder="メッセージを入力して下さい"
          className="input input-bordered join-item w-full" value={text} required
          onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-primary join-item" type="submit" disabled={isPending}>
            {isPending ? '回答中...' : '質問する'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat