'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Building2,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';
import { ProductionOrder } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  order: ProductionOrder | null;
  stage?: 'DEPOSIT' | 'FINAL_SETTLEMENT';
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  order,
  stage = 'DEPOSIT',
  onClose,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(15 * 60); // 15 mins
  const [isSuccess, setIsSuccess] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or fetch payment link whenever modal opens for an order
  useEffect(() => {
    if (!isOpen || !order) {
      setPaymentData(null);
      setIsSuccess(false);
      setCountdown(15 * 60);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const initPayment = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, stage }),
        });
        const data = await res.json();
        if (data.success) {
          setPaymentData(data.data);
          // If already paid
          if (
            (stage === 'DEPOSIT' && order.paymentStatus === 'DEPOSIT_PAID') ||
            order.paymentStatus === 'FULLY_PAID'
          ) {
            setIsSuccess(true);
          }
        } else {
          setErrorMessage(data.error || 'Không thể tạo liên kết thanh toán PayOS');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi kết nối cổng thanh toán');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [isOpen, order?.id, stage]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  // Real-time polling for payment status
  useEffect(() => {
    if (!isOpen || !order || isSuccess) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${order.id}`);
        const result = await res.json();
        if (result.success && result.data) {
          const currentStatus = result.data.paymentStatus;
          if (stage === 'DEPOSIT' && (currentStatus === 'DEPOSIT_PAID' || currentStatus === 'FULLY_PAID')) {
            setIsSuccess(true);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          } else if (stage === 'FINAL_SETTLEMENT' && currentStatus === 'FULLY_PAID') {
            setIsSuccess(true);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        }
      } catch (e) {
        // Silent poll error
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, order?.id, stage, isSuccess]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate payment webhook directly
  const handleSimulateWebhook = async () => {
    if (!paymentData || !order) return;
    setSimulating(true);
    try {
      const simulatedPayload = {
        code: '00',
        desc: 'success',
        success: true,
        data: {
          orderCode: paymentData.orderCode,
          amount: paymentData.amount,
          description: paymentData.description,
          accountNumber: paymentData.accountNumber,
          reference: `TEST_SIM_${Date.now().toString().slice(-6)}`,
          transactionDateTime: new Date().toISOString(),
          currency: 'VND',
          paymentLinkId: paymentData.paymentLinkId,
          code: '00',
          desc: 'Thanh toán mô phỏng thành công',
        },
        signature: 'sandbox_simulated_signature',
      };

      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedPayload),
      });

      const resData = await res.json();
      if (resData.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(resData.error || 'Giả lập thanh toán thất bại');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi yêu cầu giả lập');
    } finally {
      setSimulating(false);
    }
  };

  const handleFinish = () => {
    onPaymentSuccess();
    onClose();
  };

  if (!isOpen || !order) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const requiredAmount =
    paymentData?.amount ||
    (stage === 'DEPOSIT'
      ? order.depositAmount || 37500000
      : (order.totalAmount || 75000000) - (order.paidAmount || 0));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-denim-900 via-denim-800 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <QrCode className="w-5 h-5 text-denim-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight">Thanh Toán VietQR qua PayOS</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Cổng Thanh Toán Tự Động</span>
                </span>
              </div>
              <p className="text-xs text-denim-200 mt-0.5">
                Đơn hàng: <strong className="text-white">{order.orderNumber}</strong> •{' '}
                {stage === 'DEPOSIT' ? 'Mốc 1: Đặt cọc 50% kích hoạt sản xuất' : 'Mốc 2: Quyết toán 100% bàn giao'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-denim-600" />
            <p className="text-sm font-medium">Đang khởi tạo liên kết thanh toán PayOS...</p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !loading && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success View */}
        {isSuccess && !loading && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giao Dịch Đã Khớp Lệnh Thành Công</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">Thanh Toán Hoàn Tất!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hệ thống PayOS đã ghi nhận khoản tiền{' '}
                <strong className="text-slate-900 font-bold">
                  {requiredAmount.toLocaleString('vi-VN')} ₫
                </strong>{' '}
                cho đơn hàng <strong className="text-slate-900 font-bold">{order.orderNumber}</strong>.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs text-left max-w-md mx-auto space-y-2.5 shadow-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-bold text-slate-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Mã giao dịch PayOS:</span>
                <span className="font-mono font-bold text-denim-600">
                  {paymentData?.orderCode || order.payosOrderCode || 'POS-2026-LIVE'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Số tiền xác nhận:</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {requiredAmount.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nghiệp vụ BR-03:</span>
                <span className="font-bold text-purple-700">Snapshot Workflow & Kích hoạt</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full max-w-md mx-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-2"
              >
                <span>Đóng & Cập Nhật Tiến Độ Đơn Hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Payment QR and Instruction View */}
        {!loading && !isSuccess && paymentData && (
          <div className="p-6 space-y-6">
            {/* Simulation / Sandbox notice banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold">
                    {paymentData.isConfigured
                      ? 'Cổng PayOS Trực Tuyến Đang Hoạt Động'
                      : 'Chế độ Demo / Thử nghiệm VietQR (Chưa cần API Key PayOS)'}
                  </div>
                  <div className="text-[11px] text-amber-700">
                    {paymentData.isConfigured
                      ? 'Quét mã VietQR bằng ứng dụng ngân hàng bất kỳ để thanh toán thật.'
                      : 'Bạn có thể quét QR thật hoặc bấm nút giả lập bên dưới để kích hoạt flow ngay.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={simulating}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center space-x-1.5 flex-shrink-0 ml-2 disabled:opacity-50"
              >
                {simulating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Giả lập Thanh toán Thành công</span>
              </button>
            </div>

            {/* Main Content Grid: QR Left, Bank Info Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Column: VietQR Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col items-center text-center space-y-3 relative group">
                <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-denim-600" />
                    <span>{paymentData.bankName}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-rose-600 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedTime}</span>
                  </span>
                </div>

                {/* QR Container */}
                <div className="w-60 h-60 bg-white p-2 rounded-2xl border-2 border-denim-200 shadow-inner flex items-center justify-center relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paymentData.qrCode}
                    alt="PayOS VietQR"
                    className="w-full h-full object-contain"
                  />
                  {/* Scanning animation bar */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-denim-500 to-transparent animate-pulse top-1/2" />
                </div>

                <div className="text-[11px] text-slate-500 leading-tight">
                  Mở ứng dụng <strong>Ngân hàng</strong> hoặc ví <strong>VietQR</strong> để quét mã chuyển tiền nhanh
                  24/7.
                </div>

                {/* Hosted Checkout Button */}
                {paymentData.checkoutUrl && (
                  <a
                    href={paymentData.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-denim-700 transition flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <span>Mở trang PayOS Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Right Column: Bank Account Details with Copy Buttons */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Thông Tin Chuyển Khoản Thủ Công</h4>
                  <p className="text-slate-500 text-[11px]">
                    Hệ thống tự động kích hoạt tiến độ ngay khi nhận được đúng nội dung chuyển khoản.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Bank Name */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Ngân hàng thụ hưởng</div>
                      <div className="font-bold text-slate-800 text-xs">{paymentData.bankName}</div>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Số tài khoản</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {paymentData.accountNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentData.accountNumber, 'acc')}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-denim-600 hover:bg-slate-50 transition flex items-center space-x-1"
                    >
                      {copiedField === 'acc' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[11px] font-semibold">
                        {copiedField === 'acc' ? 'Đã sao chép' : 'Sao chép'}
                      </span>
                    </button>
                  </div>

                  {/* Account Owner */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Chủ tài khoản</div>
                      <div className="font-bold text-slate-800 text-xs">{paymentData.accountName}</div>
                    </div>
                  </div>

                  {/* Amount in VND */}
                  <div className="p-3 bg-denim-50/70 rounded-xl border border-denim-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-denim-700">
                        {stage === 'DEPOSIT' ? 'Số tiền cọc (50%)' : 'Số tiền quyết toán (100%)'}
                      </div>
                      <div className="font-black text-denim-900 text-base">
                        {paymentData.amount.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(paymentData.amount), 'amt')}
                      className="p-1.5 bg-white border border-denim-200 rounded-lg text-denim-700 hover:bg-denim-100 transition flex items-center space-x-1"
                    >
                      {copiedField === 'amt' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[11px] font-semibold">
                        {copiedField === 'amt' ? 'Đã chép' : 'Sao chép'}
                      </span>
                    </button>
                  </div>

                  {/* Transfer Syntax (Description) */}
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-800">
                        Nội dung chuyển khoản (Bắt buộc)
                      </div>
                      <div className="font-mono font-black text-amber-950 text-sm">
                        {paymentData.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentData.description, 'desc')}
                      className="p-1.5 bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 transition flex items-center space-x-1"
                    >
                      {copiedField === 'desc' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[11px] font-semibold">
                        {copiedField === 'desc' ? 'Đã chép' : 'Sao chép'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-denim-600" />
                    <span>Đang lắng nghe thanh toán tự động...</span>
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-bold text-slate-600 hover:text-slate-900"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
