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

export default function ArcelorMittalSignature() {
  const [data, setData] = useState({
    firstName: "Kilian",
    lastName: "De Bock",
    position: "IBO Assistent | Human Resources & Progress Academy",
    telephone: "+32 (0)93 47 49 35",
    addressLine1: "John Kennedylaan 51, B-9042 Gent",
    addressLine2: "(Hoofdgebouw, bureau 1510)",
    image: "",
    logo: "",
    gradient: "",
  });

  const [options, setOptions] = useState({
    showNotes: true,
    removeBackground: true,
  });

  const [originalImage, setOriginalImage] = useState<string>("");

  useEffect(() => {
    fetch("/images/arcelormittal-logo.png")
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

    fetch("/images/arcelormittal-gradient.svg")
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
    setData((prev) => ({ ...prev, [key]: value }));
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
      setOriginalImage(dataUrl);
      if (!data.gradient) {
        alert("Gradient image is not loaded yet. Please try again later.");
        return;
      }
      try {
        const combinedUrl = await combineImagesWithGradient(
          data.gradient,
          dataUrl,
          options.removeBackground
        );
        set("image", combinedUrl);
      } catch (error) {
        console.error("Error combining images:", error);
        alert("Failed to process image. Please try again.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-process image when removeBackground option changes
  useEffect(() => {
    if (originalImage && data.gradient) {
      combineImagesWithGradient(
        data.gradient,
        originalImage,
        options.removeBackground
      ).then(combinedUrl => {
        set("image", combinedUrl);
      }).catch(error => {
        console.error("Error reprocessing image:", error);
      });
    }
  }, [options.removeBackground, originalImage, data.gradient]);

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
                    <span style="font-size:10px;">
                      PS: Gelieve uw IBO gerichte vragen voor Human Resources naar
                      <a href="mailto:hrdigitalisation@arcelormittal.com">hrdigitalisation@arcelormittal.com</a>
                      te sturen & voor IBO vragen voor Progress Academy naar
                      <a href="mailto:gen-pac-ibo@arcelormittal.com">gen-pac-ibo@arcelormittal.com</a> te sturen.
                    </span>
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
          <Field label="Profile Image" type={FormOptionType.FILE} onFile={getBinary} />
          
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Options</h3>
            
            <div className="flex items-center justify-between">
              <label htmlFor="removeBackground" className="text-sm font-medium">
                Remove Background from Image
              </label>
              <Switch.Root
                id="removeBackground"
                checked={options.removeBackground}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeBackground: checked }))}
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
            onCopy={() => {
              alert("Signature copied to clipboard!");
            }}
            disabled={!isValid() || !data.image}
          />
        </div>
      </div>
    </Container>
  );
}
