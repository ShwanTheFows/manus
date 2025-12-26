"use client";

import { useState } from 'react';
import Image from 'next/image';
import { CloudUpload, CheckCircle } from 'lucide-react';
import { signIn } from "next-auth/react"; // ✅ Import NextAuth signIn
import { useRouter } from "next/navigation"; // ✅ For redirect

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessages, setErrorMessages] = useState({
    email: '',
    password: '',
    studentCard: '',
    city: '',
    year: '',
    firstname: '',
    lastname: ''
  });
  const [file, setFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter(); // ✅ Next.js router

  const inputClass = "w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition duration-300 text-gray-800 placeholder-gray-500 hover:border-teal-400 shadow-sm";
  const inputErrorClass = "w-full p-4 border-2 border-red-500 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition duration-300 text-gray-800 placeholder-gray-500 hover:border-red-400 shadow-sm";
  const buttonClass = "w-2/3 mx-auto py-3 mt-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:from-teal-600 hover:to-teal-700 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]";

  const validateFileExtension = (fileName) => {
    // Get file extension
    const extension = fileName.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    return allowedExtensions.includes(extension);
  };
  
  const validateFileName = (fileName) => {
    // Prevent directory traversal and special characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    return !invalidChars.test(fileName);
  };
  
  const validateFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    return allowedTypes.includes(file.type);
  };
  
  const validateFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate filename first
      if (!validateFileName(selectedFile.name)) {
        setErrorMessages({ ...errorMessages, studentCard: 'Nom de fichier invalide.' });
        setFile(null);
        return;
      }
  
      // Validate file extension
      if (!validateFileExtension(selectedFile.name)) {
        setErrorMessages({ ...errorMessages, studentCard: 'Extension de fichier non autorisée. Utilisez PDF, PNG ou JPG.' });
        setFile(null);
        return;
      }
  
      // Validate file type
      if (!validateFileType(selectedFile)) {
        setErrorMessages({ ...errorMessages, studentCard: 'Format de fichier non autorisé. Utilisez PDF, PNG ou JPG.' });
        setFile(null);
        return;
      }
  
      // Validate file size
      if (!validateFileSize(selectedFile)) {
        setErrorMessages({ ...errorMessages, studentCard: 'Le fichier dépasse la taille maximale de 5MB.' });
        setFile(null);
        return;
      }
  
      // If all checks pass
      setFile(selectedFile);
      setErrorMessages({ ...errorMessages, studentCard: '' });
    } else {
      setFile(null);
      setErrorMessages({ ...errorMessages, studentCard: '' });
    }
  };
  
  const validatePassword = (password) => {
    if (isLogin) return true; // Skip validation for login form
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '');
  };

  const encodeBase64 = (str) => {
    return typeof window !== 'undefined' ? window.btoa(unescape(encodeURIComponent(str))) : Buffer.from(str).toString('base64');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setIsSuccess(false);

    let hasError = false;
    const newErrorMessages = { ...errorMessages };

    const email = e.target.email.value;
    const password = e.target.password.value;
    const firstname = sanitizeInput(e.target.firstname?.value || '');
    const lastname = sanitizeInput(e.target.lastname?.value || '');

    if (!validateEmail(email)) {
      newErrorMessages.email = 'Format d\'email invalide';
      hasError = true;
    }

    if (!validatePassword(password)) {
      newErrorMessages.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
      hasError = true;
    }

    if (!isLogin) {
      if (!file) {
        newErrorMessages.studentCard = 'Vous devez impérativement uploader votre carte d\'étudiant pour créer un compte.';
        hasError = true;
      }

      if (!firstname || !lastname) {
        newErrorMessages.firstname = !firstname ? 'Prénom est requis.' : '';
        newErrorMessages.lastname = !lastname ? 'Nom est requis.' : '';
        hasError = true;
      }
    }

    if (hasError) {
      setErrorMessages(newErrorMessages);
      setIsSubmitted(false);
      return;
    }

    if (isLogin) {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setErrorMessages({ ...newErrorMessages, general: "Email ou mot de passe incorrect." });
          setIsSubmitted(false);
          return;
        }

        // ✅ If login is successful → redirect
        router.push("/dashboard");
      } catch (err) {
        console.error("Login failed", err);
        setErrorMessages({ ...newErrorMessages, general: "Erreur de connexion. Réessayez." });
        setIsSubmitted(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('email', email);
    formData.append('password', encodeBase64(password));
    if (!isLogin) {
      formData.append('city', e.target.city.value);
      formData.append('year', e.target.year.value);
      formData.append('file', file);
    }

    try {
      const response = await fetch('https://contact.qmed.ma/', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      // Reset form if successful
      setFile(null);
      setErrorMessages({});
      setIsSubmitted(false);
      setIsSuccess(true);
      e.target.reset();
    } catch (error) {
      console.error('Request failed', error);
      setErrorMessages({
        ...newErrorMessages,
        general: 'Une erreur est survenue. Veuillez réessayer plus tard.'
      });
      setIsSubmitted(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-white to-teal-100 py-12 px-4 animate-dreamy">
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-2xl font-bold text-teal-600 mb-4">Application en développement</h3>
            <p className="text-gray-700 mb-6">
              L'application QMed est actuellement en cours de développement. Vous serez notifié par email dès qu'elle sera disponible.
            </p>
            <button
              onClick={() => setShowLoginPopup(false)}
              className="w-full py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition duration-300"
            >
              Compris
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-14 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-xl w-full text-center backdrop-blur-lg bg-opacity-95 border border-gray-100 transition-all duration-300">
        <div className="relative w-48 mx-auto mb-10">
          <Image src="/assets/imgs/logo-qmed.png" alt="QMed Logo" width={200} height={100} className="drop-shadow-lg" priority />
        </div>

        <h2 className="text-3xl font-bold mb-10 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
          {isLogin ? 'Bienvenue sur QMed' : 'Rejoignez QMed'}
        </h2>

        {isSuccess && !isLogin && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="text-green-500" />
            <span>Votre demande a été envoyée avec succès !</span>
          </div>
        )}

        {isLogin ? (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="text-left">
              <label className="block font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                autoComplete="email"
                className={errorMessages.email ? inputErrorClass : inputClass}
              />
              {errorMessages.email && <p className="text-red-500 text-sm mt-1">{errorMessages.email}</p>}
            </div>

            <div className="text-left">
              <label className="block font-semibold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                required
                autoComplete="current-password"
                className={errorMessages.password ? inputErrorClass : inputClass}
              />
              {errorMessages.password && <p className="text-red-500 text-sm mt-1">{errorMessages.password}</p>}
            </div>

            <button type="submit" className={buttonClass} disabled={isSubmitted}>
              {isSubmitted ? 'Traitement...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <label className="block font-semibold text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstname"
                  placeholder="Votre prénom"
                  required
                  autoComplete="given-name"
                  className={errorMessages.firstname ? inputErrorClass : inputClass}
                />
                {errorMessages.firstname && <p className="text-red-500 text-sm mt-1">{errorMessages.firstname}</p>}
              </div>
              <div className="text-left">
                <label className="block font-semibold text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Votre nom"
                  required
                  autoComplete="family-name"
                  className={errorMessages.lastname ? inputErrorClass : inputClass}
                />
                {errorMessages.lastname && <p className="text-red-500 text-sm mt-1">{errorMessages.lastname}</p>}
              </div>
            </div>

            <div className="text-left">
              <label className="block font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                autoComplete="email"
                className={errorMessages.email ? inputErrorClass : inputClass}
              />
              {errorMessages.email && <p className="text-red-500 text-sm mt-1">{errorMessages.email}</p>}
            </div>

            <div className="text-left">
              <label className="block font-semibold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"
                required
                autoComplete="new-password"
                className={errorMessages.password ? inputErrorClass : inputClass}
              />
              {errorMessages.password && <p className="text-red-500 text-sm mt-1">{errorMessages.password}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <label className="block font-semibold text-gray-700 mb-2">Ville</label>
                <select
                  name="city"
                  required
                  className={errorMessages.city ? inputErrorClass : inputClass}
                >
                  <option value="">Sélectionnez votre ville</option>
                  <option value="casablanca">Casablanca</option>
                  <option value="rabat">Rabat</option>
                  <option value="tanger">Tanger</option>
                  <option value="oujda">Oujda</option>
                </select>
                {errorMessages.city && <p className="text-red-500 text-sm mt-1">{errorMessages.city}</p>}
              </div>

              <div className="text-left">
                <label className="block font-semibold text-gray-700 mb-2">Année universitaire</label>
                <select
                  name="year"
                  required
                  className={errorMessages.year ? inputErrorClass : inputClass}
                >
                  <option value="">Sélectionnez votre année</option>
                  <option value="1">1ère année</option>
                  <option value="2">2ème année</option>
                  <option value="3">3ème année</option>
                  <option value="4">4ème année</option>
                  <option value="5">5ème année</option>
                  <option value="6">6ème année</option>
                </select>
                {errorMessages.year && <p className="text-red-500 text-sm mt-1">{errorMessages.year}</p>}
              </div>
            </div>

            <div className="text-left">
  <label className="block font-semibold text-gray-700 mb-2">Carte d'étudiant <span className="text-red-500">*</span></label>
  <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group ${
    errorMessages.studentCard 
      ? 'border-red-500 bg-red-50/50 hover:border-red-600' 
      : 'border-teal-300 text-gray-500 hover:border-teal-400 hover:bg-teal-50/50'
  }`}>
    <CloudUpload className={`w-12 h-12 mb-3 transition-transform duration-300 ${
      errorMessages.studentCard ? 'text-red-500' : 'text-teal-500 group-hover:scale-110'
    }`} />
    <p className="text-sm font-medium">
      {errorMessages.studentCard ? 'Carte étudiante requise - Cliquez pour importer' : 'Cliquez pour importer ou glissez le fichier ici'}
    </p>
    <p className="text-xs mt-1">
      {errorMessages.studentCard ? (
        <span className="text-red-500">{errorMessages.studentCard}</span>
      ) : (
        <span className="text-gray-400">Format accepté : PDF, PNG, JPG — Max: 5MB</span>
      )}
    </p>
    <input
      type="file"
      name="student_card"
      accept=".pdf,image/jpeg,image/png"
      className="hidden"
      onChange={handleFileChange}
    />
  </label>
  {file && (
    <div className="mt-2 text-teal-500 text-sm">
      <span>Fichier sélectionné: {file.name}</span>
    </div>
  )}
</div>

            <button type="submit" className={buttonClass} disabled={isSubmitted}>
              {isSubmitted ? 'Envoi en cours...' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {errorMessages.general && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl">
            {errorMessages.general}
          </div>
        )}

        <div className="mt-10 text-gray-700">
          {isLogin ? (
            <p>
              Nouveau sur QMed ?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setIsSuccess(false);
                }}
                className="text-teal-500 hover:text-teal-700 font-semibold transition-colors duration-300 hover:underline"
              >
                Créer un compte
              </button>
            </p>
          ) : (
            <p>
              Déjà inscrit ?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setIsSuccess(false);
                }}
                className="text-teal-500 hover:text-teal-700 font-semibold transition-colors duration-300 hover:underline"
              >
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}