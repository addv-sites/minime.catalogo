import portadaLogo from '../assets/portada-logo.webp'

export function Portada() {
  return (
    <div className="portada">
      <span className="portada__pre">Catálogo</span>
      <img src={portadaLogo} alt="Mascota de MINI ME" className="portada__logo" />
      <h1 className="portada__marca">MINI ME</h1>
      <p className="portada__tagline">Ropa y accesorios para bebé</p>
      <span className="portada__decoracion" aria-hidden="true">
        <span className="portada__diamante" />
      </span>
    </div>
  )
}