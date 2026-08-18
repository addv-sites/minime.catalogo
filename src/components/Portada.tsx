import portadaImg from '../assets/portada.webp'

export function Portada() {
  return (
    <div className="portada">
      <img src={portadaImg} alt="MINI ME — Ropa y accesorios para bebé" className="portada__logo" />
      <p className="portada__catalogo">CATALOGO</p>
    </div>
  )
}