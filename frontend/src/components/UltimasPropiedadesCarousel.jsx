import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CardPropiedadPublica from './CardPropiedadPublica';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
// importar módulos desde rutas específicas para evitar problemas de resolución en Vite
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function UltimasPropiedadesCarousel() {
    const [propiedades, setPropiedades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const swiperRef = useRef(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true);
                const res = await axios.get('http://localhost:3000/api/propiedades/publicas?limit=12');
                setPropiedades(res.data);
            } catch (err) {
                console.error('Error cargando últimas propiedades:', err);
                setPropiedades([]);
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, []);

    // Ensure navigation binds to custom buttons after swiper and slides mount
    useEffect(() => {
        const swiper = swiperRef.current;
        if (!swiper) return;
        try {
            swiper.params.navigation = swiper.params.navigation || {};
            swiper.params.navigation.prevEl = '.custom-swiper-prev';
            swiper.params.navigation.nextEl = '.custom-swiper-next';
            // init/update navigation module
            if (swiper.navigation && typeof swiper.navigation.init === 'function') {
                swiper.navigation.init();
                swiper.navigation.update();
            }
        } catch (e) {
            // ignore
        }
    }, [propiedades]);

    if (cargando) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Últimas propiedades</h3>
                <div className="flex gap-4 overflow-x-auto">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-72 h-56 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!propiedades || propiedades.length === 0) return null;

    return (
        <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Últimas propiedades</h3>
                </div>

                {/* Custom navigation buttons (SVG) */}
                <div className="relative">
                    <button className="custom-swiper-prev absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full shadow-md p-2" aria-label="Anterior">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <button className="custom-swiper-next absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full shadow-md p-2" aria-label="Siguiente">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <Swiper
                        modules={[Autoplay, Navigation, Pagination]}
                        onSwiper={(swiper) => (swiperRef.current = swiper)}
                        spaceBetween={16}
                        loop={true}
                        // Slide-based autoplay: sensible portal behavior (pauses on hover, allows manual nav)
                        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        speed={800}
                        navigation={{ nextEl: '.custom-swiper-next', prevEl: '.custom-swiper-prev' }}
                        pagination={{ clickable: true }}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                    }}
                    className="pb-6 relative"
                >
                    {/* Styles for circular smaller navigation buttons */}
                    <style>{`
                        .custom-swiper-prev, .custom-swiper-next {
                            pointer-events: auto !important;
                            display: inline-flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                        }
                        .custom-swiper-prev:hover, .custom-swiper-next:hover {
                            transform: scale(1.05) !important;
                        }
                        .custom-swiper-prev svg, .custom-swiper-next svg {
                            display: block;
                        }
                        @media (max-width: 640px) {
                            .custom-swiper-prev, .custom-swiper-next { width: 36px !important; height: 36px !important; }
                        }
                    `}</style>
                    {propiedades.map((prop) => (
                        <SwiperSlide key={prop.id}>
                            <div className="h-[26rem] flex items-stretch">
                                <CardPropiedadPublica propiedad={prop} className="h-full" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                    </div>
            </div>
        </section>
    );
}
