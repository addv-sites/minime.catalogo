import portadaImg from '../assets/portada.webp'

export function Portada() {
  return (
    <div className="portada">
      <img src={portadaImg} alt="" aria-hidden="true" className="portada__fondo" />
      <span className="portada__pre">Catálogo</span>
      <h1 className="portada__marca">MINI ME</h1>
      <p className="portada__tagline">Ropa y accesorios para bebé</p>
      <span className="portada__decoracion" aria-hidden="true">
        <span className="portada__diamante" />
      </span>
    </div>
  )
}