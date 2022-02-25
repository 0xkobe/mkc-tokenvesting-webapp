import {
  Button,
  Container,
  Loader,
  Modal,
  Close,
} from 'decentraland-ui'
import 'decentraland-ui/lib/styles.css'
import React, { useEffect, useState, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'
import Web3Modal from 'web3modal'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

import tokenVestingABI from './abis/TokenVesting.json'

const ADDRESSES: {
  [key: number]: {
    IMPLEMENTATION: string
  }
} = {
  43114: {
    IMPLEMENTATION: '0x4BF96b80c3A1b18ff214a95e1A89D0EF61D2F48F',
  },
  56: {
    IMPLEMENTATION: '0x4BF96b80c3A1b18ff214a95e1A89D0EF61D2F48F',
  },
  43113: {
    IMPLEMENTATION: '0x4BF96b80c3A1b18ff214a95e1A89D0EF61D2F48F',
  },
  97: {
    IMPLEMENTATION: '0x4BF96b80c3A1b18ff214a95e1A89D0EF61D2F48F',
  },
}
const LINKS: {
  [key: number]: string
} = {
  43114: 'https://snowtrace.io/tx/',
  56: 'https://bscscan.com/tx/',
  43113: 'https://testnet.snowtrace.io/tx/',
  97: 'https://testnet.bscscan.com/tx/'
}

export const injected = new InjectedConnector({
  supportedChainIds: [43114, 56, 43113, 97],  // avax, bsc, tavax, tbsc
})

function App() {
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState(null)
  const { library, chainId, account, activate } = useWeb3React()

  useEffect(() => {
    activate(injected)
    if (!account) {
      setLoading(true)
      const providerOptions = {}
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })

      web3Modal
        .connect()
        .catch((e) => {
          console.error(e.message)
          alert(e.message)
        })
        .finally(() => setLoading(false))
    }
  }, [account, activate])

  const sendRequest = useCallback(async () => {
    // don't send again while we are sending
    if (loading || !chainId) return
    // update state
    setLoading(true)

    try {
      const tokenVestingImplementation = new Contract(
        ADDRESSES[chainId].IMPLEMENTATION,
        tokenVestingABI,
        library.getSigner(account).connectUnchecked()
      )

      const tx = await tokenVestingImplementation.claim(
        { from: account }
      )

      setTxHash(tx.hash)
    } catch (e) {
      console.error(e)
      setTxHash(null)
    } finally {
      setLoading(false)
    }
  }, [account, chainId, library, loading])

  const closeModal = useCallback(() => {
    setTxHash(null)
  }, [])

  return (
    <Container>
      <div className="App">
        <Loader active={loading} size="big" />
        <Modal
          size="large"
          open={!!txHash}
          closeIcon={<Close onClick={closeModal} />}
        >
          <Modal.Header>Transaction sent!</Modal.Header>
          <Modal.Content>
            <>
              <a
                href={`${LINKS[chainId!]}${txHash}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {`${LINKS[chainId!]}${txHash}`}
              </a>
            </>
          </Modal.Content>
        </Modal>
        <div></div>
        <br /><br />
        <Button
          primary
          id="submit"
          onClick={sendRequest}
        >
          Claim
        </Button>
      </div>
    </Container>
  )
}

export default App
