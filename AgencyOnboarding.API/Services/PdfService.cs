using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using AgencyOnboarding.API.Models;
using System.IO;

namespace AgencyOnboarding.API.Services;

public interface IPdfService
{
    string GenerateContractPdf(OnboardingSession session, ContractSignature signature, string destFolder);
}

public class PdfService : IPdfService
{
    public string GenerateContractPdf(OnboardingSession session, ContractSignature signature, string destFolder)
    {
        if (!Directory.Exists(destFolder)) Directory.CreateDirectory(destFolder);

        var fileName = $"{session.Id}_Contract.pdf";
        var filePath = Path.Combine(destFolder, fileName);

        using (var writer = new PdfWriter(filePath))
        using (var pdf = new PdfDocument(writer))
        using (var document = new Document(pdf))
        {
            document.Add(new Paragraph($"MASTER SERVICE AGREEMENT")
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontSize(20));

            document.Add(new Paragraph($"Prepared for: {session.ClientName}")
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(20));

            document.Add(new Paragraph(session.Template?.ContractText ?? "Standard Contract Terms")
                .SetFontSize(11));

            document.Add(new Paragraph("\n\n-------------------------------------------------\nSIGNATURE OF AGREEMENT")
                .SetMarginTop(30));

            document.Add(new Paragraph($"Electronically Signed By: {signature.SignatureDataUrl}")
                .SetFontSize(14));

            document.Add(new Paragraph($"IP Address: {signature.IpAddress}")
                .SetFontSize(10));

            document.Add(new Paragraph($"Date/Time: {signature.SignedAt.ToString("O")} (UTC)")
                .SetFontSize(10));
                
            document.Add(new Paragraph($"Agency: {session.Agency?.Name ?? "Your Agency"}")
                .SetFontSize(10));
        }

        return filePath;
    }
}
