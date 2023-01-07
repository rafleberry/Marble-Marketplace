import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  VirtualizedMessageList,
  Window,
  MessageList,
} from 'stream-chat-react'
import { getCurrentWallet } from 'util/sender-wallet'
import axios from 'axios'

// we'll reuse `useClient` hook from the "Add a Channel List" example
import { useClient } from 'hooks/useClient'

import 'stream-chat-react/dist/css/v2/index.css'

const userToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYmx1ZS1zb3VuZC0wIn0.heAnux6VqC5SLRy3gdrU37YQY5y88cwiKSxJtEWn87k'
// const userToken =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidmllcjFuZWFydGVzdG5ldCJ9._ofkNglFxe_wNLLTnEstisoVT5Hupu3FST88FBhNxy4'

const user = {
  id: 'blue-sound-0',
  name: 'blue',
  image: 'https://getstream.io/random_png/?id=blue-sound-0&name=blue-sound-0',
}
// const user = {
//   id: 'vierneartestnet',
//   name: 'mark',
//   image: 'https://getstream.io/random_png/?id=blue-sound-0&name=blue-sound-0',
// }
const App = () => {
  const wallet = getCurrentWallet()
  // const chatClient = useClient({
  //   apiKey: 'nn77pcugr4wt',
  //   userData: user,
  //   tokenOrProvider: userToken,
  // })
  const [chatClient, setChatClient] = useState(null)
  const [channel, setChannel] = useState(undefined)
  const [userInfo, setUserInfo] = useState()
  // const user = {
  //   id: 'vier1near.testnet',
  //   name: 'mark',
  //   image: 'https://getstream.io/random_png/?id=blue-sound-0&name=blue-sound-0',
  // }
  // const chatClient = useClient({
  //   apiKey: 'nn77pcugr4wt',
  //   userData: user,
  //   tokenOrProvider:
  //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidmllcjFuZWFyLnRlc3RuZXQifQ.IHbYacK5fmZuZwpXzm9QnbyeWr_hTI28T-pDgz_8VDo',
  // })
  useEffect(() => {
    ;(async () => {
      if (wallet?.accountId) {
        const chatUserInfo = await axios.get(
          'http://localhost:3030/chat/get_user',
          {
            params: { id: 'vierneartestnet' },
          }
        )
        console.log('chatUserInfo: ', chatUserInfo)
        setUserInfo(chatUserInfo.data)
        const client = StreamChat.getInstance('nn77pcugr4wt')
        await client.connectUser(
          { id: 'vierneartestnet' },
          chatUserInfo.data.token
        )
        // await client.partialUpdateUser({
        //   id: 'vierneartestnet',
        //   set: { role: 'admin' },
        // })
        // await client.updateAppSettings({
        //   permission_version: 'v2',
        //   migrate_permissions_to_v2: true,
        // })
        setChatClient(client)
        // return () => client.disconnectUser()
      }
    })()
  }, [wallet?.accountId])
  useEffect(() => {
    if (!chatClient || channel) return

    const spaceChannel = chatClient.channel('messaging', 'marble', {
      image: 'https://goo.gl/Zefkbx',
      name: 'Marble',
      members: ['vierneartestnet'],
    })
    // spaceChannel.addMembers([{ user_id: 'vierneartestnet' }]).then((result) => {
    //   console.log('result: ', result)
    // })
    setChannel(spaceChannel)
  }, [chatClient])

  if (!chatClient) return null

  return (
    <Chat client={chatClient} theme="str-chat__theme-dark">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader live />
          <MessageList />
          <MessageInput focus />
        </Window>
      </Channel>
    </Chat>
  )
}

export default App
