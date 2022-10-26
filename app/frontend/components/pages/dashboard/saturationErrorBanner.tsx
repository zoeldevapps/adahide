const SaturationErrorBanner = () => {
  return (
    <div style={{width: '100%', marginBottom: '20px'}}>
      <div className="banner saturation">
        <div className="banner-text">
          The pool you are delegating to is saturated. Delegate to another pool to get optimal rewards. For
          more information read{' '}
          <a
            target="_blank"
            style={{color: 'white'}}
            href="https://medium.com/@adalite/attention-all-cardano-stake-delegators-important-change-coming-on-december-1st-d6887c9ba13b"
          >
            here.
          </a>
        </div>
      </div>
    </div>
  )
}

export default SaturationErrorBanner
