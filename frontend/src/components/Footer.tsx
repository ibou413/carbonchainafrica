import { Leaf, Mail, MapPin, Phone, Twitter, Linkedin, Github, Shield } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../store/userSlice';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function Footer() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAdminLogin = () => {
    dispatch(setCurrentUser({ username: 'admin', role: 'ADMIN' }));
    router.push('/dashboard');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-white">CarbonChain Africa</span>
            </div>
            <p className="text-gray-400">
              The first decentralized carbon credit platform in Africa, powered by Hedera.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h3 className="text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/marketplace" className="hover:text-emerald-400 transition-colors">Marketplace</Link></li>
              <li><Link href="/#featured" className="hover:text-emerald-400 transition-colors">Featured Credits</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-emerald-400 transition-colors">How it works</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Getting Started</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Whitepaper</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
                <a href="mailto:contact@carbonchain.africa" className="hover:text-emerald-400 transition-colors">
                  contact@carbonchain.africa
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
                <span>+243 XX XXX XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
                <span>Kinshasa, DRC<br />Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2024 CarbonChain Africa. All rights reserved.
              </p>
              <button 
                onClick={handleAdminLogin}
                className="text-gray-600 hover:text-purple-400 transition-colors"
                title="Administration (Demo)"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Legal Notice</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
