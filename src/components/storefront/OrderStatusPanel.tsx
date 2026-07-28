"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Clock, Truck, PackageCheck, XCircle } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { formatPrice } from "@/lib/utils";

interface OrderDetail {
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentVerified: boolean;
  hasPaymentProof: boolean;
  trackingNumber: string | null;
  createdAt: string;
  items: { name: string; image?: string; quantity: number; price: number }[];
}

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: { label: "Esperando Pago", icon: Clock, color: "text-ivory/60" },
  PAYMENT_VERIFICATION: { label: "Pago en Revisión", icon: Clock, color: "text-gold" },
  CONFIRMED: { label: "Confirmado", icon: CheckCircle2, color: "text-success" },
  PROCESSING: { label: "Procesando", icon: PackageCheck, color: "text-success" },
  SHIPPED: { label: "Enviado", icon: Truck, color: "text-success" },
  DELIVERED: { label: "Entregado", icon: CheckCircle2, color: "text-success" },
  CANCELLED: { label: "Cancelado", icon: XCircle, color: "text-garnet" },
  REFUNDED: { label: "Reembolsado", icon: XCircle, color: "text-garnet" },
};

export default function OrderStatusPanel({ order: initial }: { order: OrderDetail }) {
  const SITE = useSiteSettings();
  const [order, setOrder] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const Icon = meta.icon;

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/payment-screenshot`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setOrder((o) => ({ ...o, status: data.order.status, hasPaymentProof: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-ivory">{order.orderNumber}</span>
          <span className={`flex items-center gap-1.5 text-sm ${meta.color}`}>
            <Icon size={15} /> {meta.label}
          </span>
        </div>
        <p className="text-xs text-ivory/40">{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      {order.status === "PENDING" && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-6">
          <p className="eyebrow mb-3">Pagar con Zelle</p>
          <p className="text-sm text-ivory/70 mb-1">
            Envía <span className="font-mono text-gold">{formatPrice(order.total)}</span> a:
          </p>
          <p className="font-mono text-lg text-ivory mb-4">{SITE.zelleNumber}</p>
          <p className="text-xs text-ivory/50 mb-4">
            Una vez enviado, sube una captura de tu confirmación de Zelle abajo. Nuestro equipo
            verifica los pagos y mueve tu pedido a procesamiento — normalmente en unas horas.
          </p>

          <label className="flex items-center justify-center gap-2 rounded-md border border-dashed border-gold/40 py-4 cursor-pointer hover:border-gold transition-colors">
            <Upload size={16} className="text-gold" />
            <span className="text-sm text-gold">{uploading ? "Subiendo…" : "Subir Captura de Pago"}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </label>
          {error && <p className="text-xs text-garnet mt-2">{error}</p>}
        </div>
      )}

      {order.status === "PAYMENT_VERIFICATION" && (
        <div className="rounded-lg border border-white/10 p-6 text-sm text-ivory/60">
          Tu captura de pago fue recibida y está siendo revisada por nuestro equipo. Actualizaremos
          el estado de tu pedido en cuanto sea verificado.
        </div>
      )}

      {order.trackingNumber && (
        <div className="rounded-lg border border-white/10 p-6">
          <p className="eyebrow mb-2">Número de Rastreo</p>
          <p className="font-mono text-ivory">{order.trackingNumber}</p>
        </div>
      )}

      <div className="rounded-lg border border-white/10 p-6">
        <p className="eyebrow mb-4">Resumen del Pedido</p>
        <div className="space-y-3 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-ivory/70">
                {item.name} × {item.quantity}
              </span>
              <span className="font-mono text-ivory/90">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-ivory/50">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-ivory/50">
              <span>Descuento</span>
              <span className="font-mono">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-ivory/50">
            <span>Envío</span>
            <span className="font-mono">{order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-gold text-base pt-1">
            <span>Total</span>
            <span className="font-mono">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
