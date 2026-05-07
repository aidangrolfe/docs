import { useState, useEffect } from 'react'

export const WalletConnector = () => {
  const [solanaAddress, setSolanaAddress] = useState('')
  const [isPhantomConnected, setIsPhantomConnected] = useState(false)
  const [availableChains, setAvailableChains] = useState([])
  const [selectedChain, setSelectedChain] = useState('BASE')
  const [isLoadingChains, setIsLoadingChains] = useState(true)
  const [chainConfigs, setChainConfigs] = useState({})
  const [selectedToken, setSelectedToken] = useState('USDT')

  useEffect(() => {
    const fetchChains = async () => {
      try {
        const response = await fetch('https://api.rhino.fi/bridge/configs')
        const data = await response.json()

        setChainConfigs(data)

        const enabled = Object.entries(data)
          .filter(([key, config]) => config.enabledDepositAddress === true)
          .map(([key, config]) => ({ id: key, name: config.name }))

        setAvailableChains(enabled)
        if (enabled.length > 0) {
          setSelectedChain(enabled[0].id)
        }
      } catch (err) {
        console.error('Error fetching chains:', err)
        setAvailableChains([
          { id: 'BASE', name: 'Base' },
          { id: 'ETHEREUM', name: 'Ethereum' }
        ])
        setSelectedChain('BASE')
      } finally {
        setIsLoadingChains(false)
      }
    }
    fetchChains()
  }, [])

  const availableTokens = chainConfigs[selectedChain]?.tokens || []

  const connectPhantom = async () => {
    try {
      if (!window.solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank')
        return
      }

      const response = await window.solana.connect()
      const address = response.publicKey.toString()
      setSolanaAddress(address)
      setIsPhantomConnected(true)
    } catch (err) {
      console.error('Error connecting to Phantom:', err)
    }
  }

  const disconnectPhantom = () => {
    setSolanaAddress('')
    setIsPhantomConnected(false)
  }

  const handleManualAddress = (e) => {
    const address = e.target.value
    setSolanaAddress(address)
    setIsPhantomConnected(false)
  }

  const iframeUrl = solanaAddress
    ? `https://address.rhino.fi/?apiKey=pk_prod_3a4c5ef11a99bec8b3a8d4ed1efa3b23ab92c5d72cef4c0caf1e5e2c1b8c2c8e&chainIn=${selectedChain}&chainOut=SOLANA&recipient=${encodeURIComponent(solanaAddress)}&token=USDT`
    : null

  return (
    <div className="not-prose">
      {/* Solana Wallet Input */}
      <div className="mb-4 border border-zinc-950/20 dark:border-white/20 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#27d0e2]/10 to-[#ff5723]/10 px-4 py-3 border-b border-zinc-950/20 dark:border-white/20">
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
            Enter Your Solana Wallet Address
          </h3>
          <p className="text-xs text-zinc-950/60 dark:text-white/60 mt-1">
            USDT will be bridged to this address
          </p>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Enter Solana wallet address"
              value={solanaAddress}
              onChange={handleManualAddress}
              disabled={isPhantomConnected}
              className="flex-1 px-3 py-2 border border-zinc-950/20 dark:border-white/20 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#27d0e2] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!isPhantomConnected ? (
              <button
                onClick={connectPhantom}
                className="px-4 py-2 bg-[#512DA8] hover:bg-[#4527a0] text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Connect Phantom
              </button>
            ) : (
              <button
                onClick={disconnectPhantom}
                className="px-4 py-2 border border-zinc-950/20 dark:border-white/20 text-zinc-950 dark:text-white rounded-lg text-sm hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                Disconnect
              </button>
            )}
          </div>

          {isPhantomConnected && (
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Phantom wallet connected
              </p>
            </div>
          )}

          {solanaAddress && !isPhantomConnected && (
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                USDT will be sent to: {solanaAddress.slice(0, 8)}...{solanaAddress.slice(-8)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chain Selection */}
      {solanaAddress && (
        <div className="mb-4 border border-zinc-950/20 dark:border-white/20 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#27d0e2]/10 to-[#ff5723]/10 px-4 py-3 border-b border-zinc-950/20 dark:border-white/20">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Select Source Chain
            </h3>
            <p className="text-xs text-zinc-950/60 dark:text-white/60 mt-1">
              Which chain are you depositing USDT from?
            </p>
          </div>
          <div className="p-4">
            {isLoadingChains ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#27d0e2]/30 border-t-[#27d0e2] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableChains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedChain === chain.id
                        ? 'bg-gradient-to-r from-[#27d0e2] to-[#19234f] text-white border-transparent'
                        : 'border-zinc-950/20 dark:border-white/20 text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rhino.fi iframe */}
      {iframeUrl ? (
        <div className="border border-zinc-950/20 dark:border-white/20 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#27d0e2]/10 to-[#ff5723]/10 px-4 py-3 border-b border-zinc-950/20 dark:border-white/20">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Bridge USDT to Solana
            </h3>
            <p className="text-xs text-zinc-950/60 dark:text-white/60 mt-1">
              Use the widget below to bridge USDT from any supported chain
            </p>
          </div>
          <div className="flex justify-center p-4 bg-zinc-950/5 dark:bg-white/5">
            <iframe
              src={iframeUrl}
              style={{ width: '400px', height: '581px', border: 'none' }}
              scrolling="no"
              title="Rhino.fi Bridge"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-950/5 dark:bg-white/5 border border-zinc-950/20 dark:border-white/20 rounded-lg">
          <p className="text-sm text-zinc-950/70 dark:text-white/70">
            Enter your Solana wallet address or connect Phantom to get started with bridging USDT.
          </p>
        </div>
      )}
    </div>
  )
}
