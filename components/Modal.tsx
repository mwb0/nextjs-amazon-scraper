"use client";

import { FormEvent, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { addTrackInfoToProduct } from "@/lib/actions";

interface Props {
  productId: string;
}

const Modal = ({ productId }: Props) => {
  let [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dropPriceFrom, setDropPriceFrom] = useState("current");
  const [dropPriceMode, setDropPriceMode] = useState("value");
  const [dropPriceValue, setDropPriceValue] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    await addTrackInfoToProduct(productId, email, phone, dropPriceFrom, dropPriceMode, dropPriceValue);

    setIsSubmitting(false);
    setEmail("");
    setPhone("");
    setDropPriceValue("");
    closeModal();
  };

  const openModal = () => setIsOpen(true);

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" onClose={closeModal} className="dialog-container">
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            />
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="dialog-content">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <Image
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      width={24}
                      height={24}
                      className="cursor-pointer"
                      onClick={closeModal}
                    />
                  </div>
                  <h4 className="text-center dialog-head_text">
                    Track price info
                  </h4>
                  <p className="text-sm text-center text-gray-600 mt-2">
                    You will get alerts whenever there is a price drop
                  </p>
                </div>
                <form className="flex flex-col mt-3" onSubmit={handleSubmit}>
                  <div className="flex flex-col dialog-input_container">
                    <Image
                      src="/assets/icons/mail.svg"
                      alt="mail"
                      width={18}
                      height={18}
                    />
                    <input
                      required
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="dialog-input"
                    />
                  </div>
                  <div className="flex flex-col dialog-input_container">
                    <Image
                      src="/assets/icons/phone-call.svg"
                      alt="mail"
                      width={18}
                      height={18}
                    />
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="dialog-input"
                      pattern="^\+\d{1,3}-\d{3}-\d{3}-\d{4}$" 
                      title="Phone number should be in format: +1-123-456-7890"
                    />
                  </div>
                  <div className="flex flex-col dialog-input_container">
                    <Image
                      src="/assets/icons/line-chart.png"
                      alt="drop price mode"
                      width={18}
                      height={18}
                    />
                    <select
                      id="dropPriceFrom"
                      value={dropPriceFrom}
                      onChange={(e) => setDropPriceFrom(e.target.value)}
                      className="dialog-input w-7/12"
                    >
                      <option value="current">From Current Price</option>
                      <option value="average">From Average Price</option>
                      <option value="highest">From Highest Price</option>
                      <option value="lowest">From Lowest Price</option>
                    </select>
                  </div>
                  <div className="flex flex-col dialog-input_container">
                    <Image src="/assets/icons/price-down.svg" alt="drop price mode" width={18} height={18} />
                    <div className="flex gap-1">
                      <input
                        required
                        type="number"
                        name="drop_price"
                        id="drop_price"
                        placeholder="Drop price value"
                        className="dialog-input"
                        value={dropPriceValue}
                        onChange={(e) => setDropPriceValue(e.target.value)}
                      />
                      <select
                        id="dropPriceMode"
                        value={dropPriceMode}
                        onChange={(e) => setDropPriceMode(e.target.value)}
                        className="dialog-input"
                      >
                        <option value="value">Value ($)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="dialog-btn">
                    {isSubmitting ? "Submitting..." : "Track"}
                  </button>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
