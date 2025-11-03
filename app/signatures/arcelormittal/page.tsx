"use client";

import { Container } from "@/components/Container";
import React, { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import styles from "./page.module.scss";
import { FormOptionType } from "@/components/Form";
import { safeParseFieldString } from "@/lib/parse";
import { combineImagesWithGradient } from "@/lib/image-processing";
import * as Switch from "@radix-ui/react-switch";
import { CopyBox } from "@/components/CopyBox";
import { loadSignatureData, saveSignatureData, clearSignatureData, saveImageData, loadImageData } from "@/lib/storage";

export default function ArcelorMittalSignature() {
  const defaultData = {
    firstName: "",
    lastName: "",
    position: "Functie | Afdeling",
    telephone: "+32 (0)93 47 XX XX",
    addressLine1: "John Kennedylaan 51, B-9042 Gent",
    addressLine2: "(Locatie, bureau xx)",
    psMessage: "",
    image: "",
    logo: "",
    gradient: "",
  };

  const [data, setData] = useState(defaultData);

  const [options, setOptions] = useState({
    showNotes: true,
  });

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
        psMessage: savedData.psMessage || defaultData.psMessage,
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

    fetch("/images/arcelormittal/arcelormittal-logo.png")
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

    fetch("/images/arcelormittal/arcelormittal-gradient.svg")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setData((prev) => ({
            ...prev,
            gradient: reader.result as string,
          }));
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => {
        console.error("Error fetching the gradient:", error);
      });
  }, []);

  const signatureRef = React.useRef<HTMLDivElement>(null);

  const set = (key: string, value: string) => {
    setData((prev) => {
      const newData = { ...prev, [key]: value };
      // Save to localStorage (excluding image, logo, gradient)
      if (!['image', 'logo', 'gradient'].includes(key)) {
        saveSignatureData({
          firstName: newData.firstName,
          lastName: newData.lastName,
          position: newData.position,
          telephone: newData.telephone,
          addressLine1: newData.addressLine1,
          addressLine2: newData.addressLine2,
          psMessage: newData.psMessage,
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
      gradient: data.gradient,
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

  const getBinary = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      if (!data.gradient) {
        alert("Gradient image is not loaded yet. Please try again later.");
        return;
      }
      try {
        const combinedUrl = await combineImagesWithGradient(
          data.gradient,
          dataUrl,
          false // Always use false since we're removing the background removal feature
        );
        set("image", combinedUrl);
        // Save the processed image to localStorage
        saveImageData(combinedUrl);
      } catch (error) {
        console.error("Error combining images:", error);
        alert("Failed to process image. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  const buildSignatureHtml = () => {
    return `${options.showNotes ? `<p style="color:#0C0C0C;font-family:Arial;font-size:12px;line-height:130%">
        Beste<br><br>
        Text<br><br>
        Alvast bedankt.<br><br>
        Met vriendelijke groeten / Kind regards<br>
      </p>` : ''}
      <table style="position:relative">
        <tbody>
          <tr>
            <td style="width:160px;vertical-align:bottom;">
              <img src="${data.image}" alt="Profile with Background" style="width:160px;height:175px;" />
            </td>
            <td style="vertical-align:bottom;padding-left:8px">
              <table style="width:512px;margin-top:16px;">
                <tr>
                  <td>
                    <span style="font-family:Arial;font-size:16px;color:#000;">
                      ${data.firstName} ${data.lastName}
                    </span>
                    <br>
                    <span style="font-family:Arial;font-size:11px;color:#333;">
                      ${data.position}
                    </span>
                  </td>
                  <td style="margin-left:auto;width:80px;">
                    <img src="${data.logo}" alt="Logo" style="width:80px;height:36px;" />
                  </td>
                </tr>
              </table>
              <table style="width:512px;margin-top:16px;">
                <tr>
                  <td style="font-family:Arial;font-size:11px;color:#333;width:512px">
                    <strong style="color:#F25900;">T ${formatTelephone(data.telephone)}</strong><br>
                    Of <a href="?" style="color:#F25900;text-decoration:underline;">chat in Teams</a><br><br>
                    ${data.addressLine1}<br>
                    ${data.addressLine2}<br><br>
                    ${data.psMessage ? `<span style="font-size:10px;">
                      ${data.psMessage}
                    </span>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>`;
  };

  return (
    <Container>
      <h1 className="text-3xl font-bold text-[#100429] mb-6">ArcelorMittal Signature</h1>

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
          <Field
            label="PS Message (optional)"
            type={FormOptionType.TEXTAREA}
            onChange={(e) => set("psMessage", safeParseFieldString(e))}
            value={data.psMessage}
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
