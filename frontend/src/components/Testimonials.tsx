import { Card } from './ui/card';
import { Quote, Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Responsable RSE, TotalEnergies",
      avatar: "👩‍💼",
      content: "CarbonChain Africa nous permet de compenser notre empreinte carbone avec des projets africains vérifiés. La transparence blockchain est un vrai plus.",
      rating: 5,
      country: "France"
    },
    {
      name: "Jean-Paul Mukendi",
      role: "Porteur de Projet",
      avatar: "👨‍🌾",
      content: "J'ai pu tokeniser mon projet de reforestation et le vendre sur la marketplace en quelques jours. Les paiements sont rapides et sécurisés.",
      rating: 5,
      country: "RDC"
    },
    {
      name: "Dr. Amina Hassan",
      role: "Vérificatrice VCS",
      avatar: "👩‍🔬",
      content: "La plateforme facilite énormément le processus de vérification. L'intégration blockchain garantit l'authenticité des certifications.",
      rating: 5,
      country: "Kenya"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-900 to-teal-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4">Ce que disent nos utilisateurs</h2>
          <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
            Des milliers d'utilisateurs font confiance à CarbonChain Africa
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Quote className="w-8 h-8 text-emerald-400 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-emerald-100 mb-6">{testimonial.content}</p>

              <div className="flex items-center gap-3 border-t border-white/20 pt-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white">{testimonial.name}</p>
                  <p className="text-sm text-emerald-200">{testimonial.role}</p>
                  <p className="text-xs text-emerald-300">{testimonial.country}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
