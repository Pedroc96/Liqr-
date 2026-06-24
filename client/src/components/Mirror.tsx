"use client";

import { motion } from "framer-motion";
import { SwipeRecord } from "@/hooks/useSession";
import { generateMirror } from "@/lib/mirror";

interface MirrorProps {
  history: SwipeRecord[];
  onRestart: () => void;
}

export default function Mirror({ history, onRestart }: MirrorProps) {
  const { liked, skipped, insights } = generateMirror(history);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <h1 className="text-3xl font-serif italic text-amber-50 text-center mb-2">
          O espelho
        </h1>
        <p className="text-zinc-500 text-sm text-center mb-10">
          Não és tu. É o sistema que usaste — e que já existia.
        </p>

        <div className="space-y-5">
          {insights.map((insight, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.4 }}
              className="text-zinc-300 text-sm leading-relaxed border-l border-zinc-800 pl-4"
            >
              {insight.text}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + insights.length * 0.4 + 0.5 }}
          className="mt-10 pt-6 border-t border-zinc-800"
        >
          <p className="text-zinc-400 text-sm leading-relaxed italic">
            O Liqr Score não inventou nada. Pesou o que já pesávamos — só que
            sem o admitir. A pergunta não é se concordas com os pesos. É se
            reconheces o resultado.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + insights.length * 0.4 + 1.2 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={onRestart}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wide"
          >
            Recomeçar
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}
