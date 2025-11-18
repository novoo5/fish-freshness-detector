'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Eye, Droplets, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisResults {
  isFresh: boolean;
  confidence: number;
  eyeClarity: number;
  corneaTransparency: number;
  pupilColor: string;
  eyeShape: string;
  estimatedTVBN: number;
  sniScore: number;
}

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-cyan-400');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-cyan-400');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-cyan-400');

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const mockEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(mockEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🐟 AI-Powered Fish Freshness Detection
          </h1>
          <p className="text-xl text-slate-300">
            Real-time biological marker analysis using computer vision by Novoo
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
            <label>
              <div
                className="border-2 border-dashed border-cyan-500/50 rounded-xl p-12 text-center hover:border-cyan-400 transition-all cursor-pointer bg-slate-900/30"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className="mx-auto mb-4 text-cyan-400" size={48} />
                </motion.div>
                <p className="text-lg font-semibold mb-2">Upload a close-up photo of the fish eye</p>
                <p className="text-sm text-slate-400 mb-4">Supported formats: JPG, PNG (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div
                  className="bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105 inline-block cursor-pointer"
                >
                  Select Image or Drop Here
                </div>

              </div>
            </label>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 <strong>Tip:</strong> Focus on the eye region. The eye should be clearly visible and well-lit. Good lighting helps accuracy.
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-300 flex items-center gap-2">
              <AlertCircle size={20} /> {error}
            </p>
          </motion.div>
        )}

        {uploadedImage && (
          <motion.div
            className="max-w-6xl mx-auto mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {analyzing ? (
              <div className="text-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  <div className="rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
                </motion.div>
                <p className="text-lg text-slate-300 mt-4">Analyzing biological markers...</p>
              </div>
            ) : results && (
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-3">Original Fish Eye Image</h3>
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="rounded-xl w-full shadow-2xl border border-slate-700"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold mb-3">AI Analysis Heatmap</h3>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl aspect-square flex flex-col items-center justify-center border border-slate-700 shadow-2xl p-6">
                      <Eye className="text-cyan-400 mb-3" size={48} />
                      <p className="text-slate-400 text-center">Heatmap visualization - Model attention areas</p>
                      <p className="text-xs text-slate-500 mt-3">Coming soon: Grad-CAM overlay</p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`rounded-2xl p-8 border ${results.isFresh
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500'
                    : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500'
                    }`}
                >
                  <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div className="flex items-center gap-4">
                      {results.isFresh ? (
                        <CheckCircle size={48} className="text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle size={48} className="text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <h2 className="text-3xl font-bold">
                          {results.isFresh ? '✅ FRESH - Safe to Consume' : '❌ NOT FRESH - Discard This Fish'}
                        </h2>
                        <p className="text-slate-300 mt-1">
                          Confidence Level: {Math.round(results.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <motion.div
                      className="text-right flex-shrink-0"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                    >
                      <div className={`text-5xl font-bold ${results.isFresh ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {Math.round(results.confidence * 100)}%
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-bold mb-6">🔬 Detected Biological Markers</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <IndicatorCard
                      title="Eye Clarity Score"
                      value={`${results.eyeClarity}/10`}
                      status={results.isFresh ? 'Excellent' : 'Poor'}
                      color={results.isFresh ? 'green' : 'red'}
                      delay={0.5}
                    />
                    <IndicatorCard
                      title="Cornea Transparency"
                      value={`${results.corneaTransparency}%`}
                      status={results.isFresh ? 'Clear' : 'Cloudy'}
                      color={results.isFresh ? 'cyan' : 'red'}
                      delay={0.55}
                    />
                    <IndicatorCard
                      title="Pupil Color Analysis"
                      value={results.pupilColor}
                      status={results.isFresh ? 'Bright' : 'Dull'}
                      color={results.isFresh ? 'blue' : 'red'}
                      delay={0.6}
                    />
                    <IndicatorCard
                      title="Eye Shape Assessment"
                      value={results.eyeShape}
                      status={results.isFresh ? 'Bulging' : 'Sunken'}
                      color={results.isFresh ? 'green' : 'red'}
                      delay={0.65}
                    />
                    <IndicatorCard
                      title="Estimated TVB-N Level"
                      value={`${results.estimatedTVBN} mg/100g`}
                      status={results.isFresh ? 'Fresh Range' : 'Spoiled Range'}
                      color={results.isFresh ? 'cyan' : 'red'}
                      delay={0.7}
                      footnote="Safe: <15"
                    />
                    <IndicatorCard
                      title="SNI Freshness Score"
                      value={`${results.sniScore}/9`}
                      status={results.isFresh ? 'Excellent' : 'Poor'}
                      color={results.isFresh ? 'blue' : 'red'}
                      delay={0.75}
                      footnote="SNI 2729-2013"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        <ReferenceGuide />
      </div>
    </div>
  );
}

interface IndicatorCardProps {
  title: string;
  value: string;
  status: string;
  color: 'green' | 'cyan' | 'blue' | 'red';
  delay: number;
  footnote?: string;
}

function IndicatorCard({ title, value, status, color, delay, footnote }: IndicatorCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500 text-green-300',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500 text-cyan-300',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500 text-blue-300',
    red: 'from-red-500/20 to-orange-500/20 border-red-500 text-red-300',
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h3 className="font-semibold mb-3 text-sm">{title}</h3>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-sm text-slate-300">{status}</p>
      {footnote && <p className="text-xs text-slate-400 mt-2">{footnote}</p>}
    </motion.div>
  );
}

function ReferenceGuide() {
  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="border-t border-slate-700 pt-12">
        <h2 className="text-3xl font-bold mb-10 text-center">📚 Understanding Fish Freshness Indicators</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-green-400 mb-4">✅ Fresh Fish Eye</h3>
            <div className="bg-slate-700 rounded-xl h-48 mb-4 flex items-center justify-center overflow-hidden border border-slate-600">
              <img
                src="/reference/fresh-eye-1.jpg"
                alt="Fresh fish eye"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="hidden text-slate-400">[Fresh eye reference image]</div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                <span className="text-slate-300">Clear, transparent cornea</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                <span className="text-slate-300">Deep black, shiny pupil</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                <span className="text-slate-300">Bulging, convex eyeball</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                <span className="text-slate-300">Reflective, glossy surface</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                <span className="text-slate-300">No cloudiness or discoloration</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-red-400 mb-4">❌ Spoiled Fish Eye</h3>
            <div className="bg-slate-700 rounded-xl h-48 mb-4 flex items-center justify-center overflow-hidden border border-slate-600">
              <img
                src="/reference/spoiled-eye-1.jpg"
                alt="Spoiled fish eye"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="hidden text-slate-400">[Spoiled eye reference image]</div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                <span className="text-slate-300">Cloudy, opaque cornea</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                <span className="text-slate-300">Gray, dull, or pale pupil</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                <span className="text-slate-300">Sunken, concave eyeball</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                <span className="text-slate-300">Matte, dull surface</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold flex-shrink-0">✗</span>
                <span className="text-slate-300">Brown or discolored appearance</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <SNITable />
      </div>

      <motion.div
        className="border-t border-slate-700 pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <p className="text-yellow-300 flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-1" size={20} />
            <span>
              <strong>⚠️ Disclaimer:</strong> This tool provides visual analysis of fish eyes only. For commercial use, combine with laboratory chemical testing (TVB-N, pH). Not a replacement for official quality standards.
            </span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SNITable() {
  const [expanded, setExpanded] = useState(false);

  const sniData = [
    { score: 9, condition: 'Excellent', description: 'Clear cornea, bright eyes, fresh appearance' },
    { score: 7, condition: 'Good', description: 'Slightly cloudy, minor discoloration' },
    { score: 5, condition: 'Fair', description: 'Moderately cloudy, some gray coloring' },
    { score: 3, condition: 'Poor', description: 'Very cloudy, gray/sunken appearance' },
    { score: 1, condition: 'Spoiled', description: 'Completely opaque, severely sunken' },
  ];

  return (
    <motion.div
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.65 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-lg font-semibold hover:text-cyan-400 transition-colors"
      >
        <span>📋 SNI 2729-2013 Standard Reference Table</span>
        <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <motion.div
          className="mt-6 overflow-x-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-cyan-400">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-cyan-400">Condition</th>
                <th className="text-left py-3 px-4 font-semibold text-cyan-400">Description</th>
              </tr>
            </thead>
            <tbody>
              {sniData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`font-bold ${row.score >= 7 ? 'text-green-400' : row.score >= 5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                      {row.score}/9
                    </span>
                  </td>
                  <td className="py-3 px-4">{row.condition}</td>
                  <td className="py-3 px-4 text-slate-300">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
