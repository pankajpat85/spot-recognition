interface WinnerInfo {
  name: string
}

interface SpotEmailData {
  orgName: string
  winners: WinnerInfo[]
  senderName: string
  description: string
  startDate: string
  endDate: string
  imageAttachmentCid: string
}

export function spotRecognitionTemplate(data: SpotEmailData): string {
  const winnerNames = data.winners.map(w => w.name).join(', ')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#00a089,#00c4a7);padding:32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">🏆 Spot Recognition</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;">${data.orgName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;text-align:center;">
            <h2 style="color:#1a1a2e;font-size:22px;margin:0 0 8px;">Congratulations, ${winnerNames}!</h2>
            <p style="color:#666;margin:0 0 24px;">You've been recognized for your outstanding contribution.</p>
            <p style="color:#444;font-size:15px;line-height:1.6;margin:0 0 16px;">${data.description}</p>
            <p style="color:#888;font-size:13px;margin:0 0 32px;">
              Recognition period: ${data.startDate} – ${data.endDate}<br>
              Given by: <strong>${data.senderName}</strong>
            </p>
            <img src="cid:${data.imageAttachmentCid}" alt="Wall of Fame" style="max-width:100%;border-radius:8px;display:block;margin:0 auto;" />
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">Sent via Spot Recognition Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
