"use client";

import { Container } from "@/components/Container";
import React, { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import styles from "./page.module.scss";
import { FormOptionType } from "@/components/Form";
import { safeParseFieldString } from "@/lib/parse";
import { processImageWithCircularMask } from "@/lib/image-processing";
import * as Switch from "@radix-ui/react-switch";
import { CopyBox } from "@/components/CopyBox";
import { loadSignatureData, saveSignatureData, clearSignatureData, saveImageData, loadImageData } from "@/lib/storage";

export default function LyttleDevelopmentSignature() {
  const defaultData = {
    firstName: "",
    lastName: "",
    position: "",
    telephone: "+32",
    addressLine1: "Damstraat 65,",
    addressLine2: "9180 Lokeren, België",
    image: "",
    logo: "",
  };

  const [data, setData] = useState(defaultData);

  const [options, setOptions] = useState({
    showNotes: true,
    showBranding: true,
    applyGrayscale: true,
  });

  const [originalImage, setOriginalImage] = useState<string>("");

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = loadSignatureData();
    if (savedData) {
      setData((prev) => ({
        ...prev,
        firstName: savedData.firstName,
        lastName: savedData.lastName,
        position: savedData.position || defaultData.position,
        telephone: savedData.telephone || defaultData.telephone,
        addressLine1: savedData.addressLine1 || defaultData.addressLine1,
        addressLine2: savedData.addressLine2 || defaultData.addressLine2,
      }));
    }

    // Load saved image if exists
    const savedImage = loadImageData();
    if (savedImage) {
      setData((prev) => ({
        ...prev,
        image: savedImage,
      }));
    }

    fetch("/images/lyttledevelopment/lyttledevelopment-logo.png")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setData((prev) => ({
            ...prev,
            logo: reader.result as string,
          }));
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.error("Error fetching the logo:", error);
      });
  }, []);

  const signatureRef = React.useRef<HTMLDivElement>(null);

  const set = (key: string, value: string) => {
    setData((prev) => {
      const newData = { ...prev, [key]: value };
      // Save to localStorage (excluding image and logo)
      if (!['image', 'logo'].includes(key)) {
        saveSignatureData({
          firstName: newData.firstName,
          lastName: newData.lastName,
          position: newData.position,
          telephone: newData.telephone,
          addressLine1: newData.addressLine1,
          addressLine2: newData.addressLine2,
        });
      }
      return newData;
    });
  };

  const handleClearData = () => {
    clearSignatureData();
    setData({
      ...defaultData,
      logo: data.logo,
      image: "",
    });
  };

  const isValid = () => {
    return (
      data.firstName &&
      data.lastName &&
      data.position &&
      data.telephone &&
      data.addressLine1
    );
  };

  const formatTelephone = (telephone: string): string => {
    const cleanNumber = telephone.replace(/\D/g, "");

    if (/^04\d{8}$/.test(cleanNumber)) {
      return `${cleanNumber.slice(0, 4)} ${cleanNumber.slice(4, 6)} ${cleanNumber.slice(6, 8)} ${cleanNumber.slice(8, 10)}`;
    }
    if (/^324\d{8}$/.test(cleanNumber)) {
      return `+32 ${cleanNumber.slice(2, 5)} ${cleanNumber.slice(5, 7)} ${cleanNumber.slice(7, 9)} ${cleanNumber.slice(9, 11)}`;
    }

    if (/^0[1-9]\d{7,8}$/.test(cleanNumber)) {
      if (cleanNumber.startsWith("02")) {
        return `${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 3)} ${cleanNumber.slice(3, 5)} ${cleanNumber.slice(5, 7)} ${cleanNumber.slice(7)}`;
      } else {
        return `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6, 8)} ${cleanNumber.slice(8)}`;
      }
    }
    if (/^32[1-9]\d{7,8}$/.test(cleanNumber)) {
      if (cleanNumber.startsWith("322")) {
        return `+32 ${cleanNumber.slice(2, 4)} ${cleanNumber.slice(4, 5)} ${cleanNumber.slice(5, 7)} ${cleanNumber.slice(7, 9)} ${cleanNumber.slice(9)}`;
      } else {
        return `+32 ${cleanNumber.slice(2, 5)} ${cleanNumber.slice(5, 8)} ${cleanNumber.slice(8, 10)} ${cleanNumber.slice(10)}`;
      }
    }
    return telephone;
  };

  const getBinary = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setOriginalImage(dataUrl);
      try {
        const processedImage = await processImageWithCircularMask(
          dataUrl,
          121,
          options.applyGrayscale
        );
        set("image", processedImage);
        // Save the processed image to localStorage
        saveImageData(processedImage);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-process image when grayscale option changes
  useEffect(() => {
    if (originalImage) {
      processImageWithCircularMask(
        originalImage,
        121,
        options.applyGrayscale
      ).then(processedImage => {
        set("image", processedImage);
        // Save the reprocessed image to localStorage
        saveImageData(processedImage);
      }).catch(error => {
        console.error("Error reprocessing image:", error);
      });
    }
  }, [options.applyGrayscale, originalImage]);

  const buildSignatureHtml = () => {
    return `${options.showNotes ? `<p style="color:#0C0C0C;font-family:Arial;font-size:12px;line-height:130%">
      Beste<br><br>
      Text<br><br>
      Alvast bedankt.<br><br>
      Met vriendelijke groeten / Kind regards<br><br>
    </p>` : ''}
    <table>
      <tbody>
        <tr>
          <td style="padding-right:11px;width:160px;border-right:1px solid #E5E4E4;vertical-align:top;">
            <div style="padding-bottom:24px;">
              <img src="${data.image}" alt="Profile Picture" style="width:122px;height:122px;" />
            </div>
            ${options.showBranding ? `<div>
              <img src="${data.logo}" alt="LyttleDevelopment Logo" style="width:120px;height:43px;" />
            </div>` : ''}
          </td>
          <td style="padding-left:45px;vertical-align:top;">
            <p style="color:#100429;font-family:Arial;font-size:13px;line-height:18px;">
              <span style="font-weight:700;">
                ${data.firstName} ${data.lastName}
              </span>
              <br />
              ${data.position}<br />
              <br />
              ${formatTelephone(data.telephone)}<br />
              <br />
              ${data.addressLine1}<br />
              ${data.addressLine2}<br />
            </p>
            ${options.showBranding ? `<table>
              <tbody>
                <tr>
                  <td>
                    <p style="color:#100429;font-family:Arial;font-size:11px;line-height:16px;">
                      Ontdek de succesverhalen<br />
                      via <a href="https://www.lyttledevelopment.com/?ref=email-signature">lyttledevelopment.com</a>
                    </p>
                  </td>
                  <td style="padding-left:65px;">
                    <p style="padding-top:20px;color:#100429;font-family:Arial;font-size:11px;font-weight:700;line-height:18px;">
                      Let's make the Lyttle details,<br />
                      become a lasting impression!
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>` : ''}
          </td>
        </tr>
      </tbody>
    </table>`;
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold text-[#100429] mb-6">Lyttle Development Signature</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <Field
            label="First Name"
            required
            onChange={(e) => set("firstName", safeParseFieldString(e))}
            value={data.firstName}
          />
          <Field
            label="Last Name"
            required
            onChange={(e) => set("lastName", safeParseFieldString(e))}
            value={data.lastName}
          />
          <Field
            label="Position"
            required
            onChange={(e) => set("position", safeParseFieldString(e))}
            value={data.position}
          />
          <Field
            label="Telephone"
            required
            onChange={(e) => set("telephone", safeParseFieldString(e))}
            value={data.telephone}
          />
          <Field
            label="Address Line 1"
            required
            onChange={(e) => set("addressLine1", safeParseFieldString(e))}
            value={data.addressLine1}
          />
          <Field
            label="Address Line 2"
            onChange={(e) => set("addressLine2", safeParseFieldString(e))}
            value={data.addressLine2}
          />
          <Field label="Profile Image" type={FormOptionType.FILE} onFile={getBinary} />

          <div className="mt-6 mb-4">
            <button
              onClick={handleClearData}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Saved Data & Use Defaults
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Options</h3>

            <div className="flex items-center justify-between">
              <label htmlFor="grayscale" className="text-sm font-medium">
                Apply Grayscale to Image
              </label>
              <Switch.Root
                id="grayscale"
                checked={options.applyGrayscale}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, applyGrayscale: checked }))}
                className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-indigo-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="notes" className="text-sm font-medium">
                Include Default Text
              </label>
              <Switch.Root
                id="notes"
                checked={options.showNotes}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showNotes: checked }))}
                className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-indigo-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="branding" className="text-sm font-medium">
                Show Branding
              </label>
              <Switch.Root
                id="branding"
                checked={options.showBranding}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showBranding: checked }))}
                className="w-11 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-indigo-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className={styles.signature_container}>
            {isValid() && data.image ? (
              <div
                ref={signatureRef}
                className="signature-preview"
                dangerouslySetInnerHTML={{ __html: buildSignatureHtml() }}
              />
            ) : (
              <p className="text-gray-600">
                Please fill in all required fields and upload an image to see the preview.
              </p>
            )}
          </div>

          <CopyBox
            signatureHtml={buildSignatureHtml()}
            disabled={!isValid() || !data.image}
          />
        </div>
      </div>
    </Container>
  );
}
