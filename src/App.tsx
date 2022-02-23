import {
  Button,
  Container,
  Footer,
  Loader,
  Modal,
  Segment,
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
  1: {
    IMPLEMENTATION: '0x42f32e19365d8045661a006408cc6d1064039fbf',
  },
  3: {
    IMPLEMENTATION: '0xc243b243a2033348730420ea55239767802a19d0',
  },
  4: {
    IMPLEMENTATION: '0x8493bb6ae17e12c062b0eb1fe780cc0b2df16bb2',
  },
}
const LINKS: {
  [key: number]: string
} = {
  1: 'https://etherscan.io/tx/',
  3: 'https://ropsten.etherscan.io/tx/',
  4: 'https://rinkeby.etherscan.io/tx/'
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
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
        <Segment>
          <Button
            primary
            id="submit"
            onClick={sendRequest}
          >
            Claim
          </Button>
        </Segment>
        <Footer></Footer>
      </div>
    </Container>
  )
}

export default App
