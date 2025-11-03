import Link from "next/link";
import { Container } from "@/components/Container";

export default function Home() {
  const signatures = [
    {
      id: "lyttledevelopment",
      name: "Lyttle Development",
      description: "Professional email signature for Lyttle Development team members",
      href: "/signatures/lyttledevelopment",
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: "arcelormittal",
      name: "ArcelorMittal",
      description: "Corporate email signature for ArcelorMittal employees",
      href: "/signatures/arcelormittal",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <Container>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#100429] mb-4">
          Email Signature Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create professional email signatures for your organization. Choose a signature template below to get started.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {signatures.map((signature) => (
          <Link
            key={signature.id}
            href={signature.href}
            className="group block p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all hover:shadow-lg"
          >
            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${signature.color} mb-4 group-hover:scale-110 transition-transform`} />
            <h2 className="text-2xl font-semibold text-[#100429] mb-2 group-hover:text-indigo-600 transition-colors">
              {signature.name}
            </h2>
            <p className="text-gray-600">
              {signature.description}
            </p>
            <div className="mt-4 text-indigo-600 font-medium group-hover:translate-x-2 transition-transform inline-block">
              Create signature →
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-block p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-[#100429] mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            Each signature generator provides a simple form to customize your details.
          </p>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li>✓ Fill in your personal information</li>
            <li>✓ Upload your photo</li>
            <li>✓ Customize settings</li>
            <li>✓ Copy to clipboard</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
