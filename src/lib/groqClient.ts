import type { FDPosition } from '@/types';

export const GROQ_CONFIG = {
  apiKey: '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',
  baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  maxTokens: 1024,
  temperature: 0.3,
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PortfolioContext {
  totalAUM: number;
  fdCount: number;
  avgRate: number;
  upcomingMaturities: number;
  topHoldings: FDPosition[];
  monthlyInterest: number;
}

const SYSTEM_PROMPT = `You are NyneAI, an expert treasury assistant for NyneOS FinFlow — an institutional Fixed Deposit Management System.

Your capabilities:
- Analyze FD portfolios and provide insights
- Explain treasury concepts (accruals, TDS, rollovers)
- Calculate returns and compare rates
- Summarize cash flow projections
- Answer questions about Indian banking regulations

Constraints:
- You can ONLY discuss treasury, fixed deposits, banking, and finance topics
- If asked about non-finance topics, politely redirect to treasury matters
- Always provide accurate, professional responses suitable for CFOs and treasury teams
- Use Indian number format (lakhs, crores) where appropriate
- Format currency as ₹X.XX Cr or ₹X,XX,XXX

When portfolio data is provided, use it to give contextual answers.`;

function formatPortfolioContext(context?: PortfolioContext): string {
  if (!context) return '';
  
  return `
Current Portfolio Context:
- Total AUM: ₹${(context.totalAUM / 10000000).toFixed(2)} Cr
- Active FDs: ${context.fdCount}
- Average Rate: ${context.avgRate.toFixed(2)}%
- Upcoming Maturities (30 days): ${context.upcomingMaturities}
- Monthly Interest Income: ₹${(context.monthlyInterest / 100000).toFixed(2)} Lakhs
- Top Holdings: ${context.topHoldings.map(fd => `${fd.bankName} (₹${(fd.principal / 10000000).toFixed(2)} Cr)`).join(', ')}
`;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  portfolioContext?: PortfolioContext
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const contextPrompt = formatPortfolioContext(portfolioContext);
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
      ...messages,
    ];

    const response = await fetch(GROQ_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: fullMessages,
        max_tokens: GROQ_CONFIG.maxTokens,
        temperature: GROQ_CONFIG.temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      
      // Handle specific error codes
      if (response.status === 401) {
        return { success: false, error: 'Authentication failed. Please check API configuration.' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Please try again in a moment.' };
      }
      if (response.status >= 500) {
        return { success: false, error: 'AI service temporarily unavailable. Please try again later.' };
      }
      
      return { success: false, error: 'Failed to get response from AI. Please try again.' };
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      return { success: false, error: 'Invalid response from AI service.' };
    }

    return { 
      success: true, 
      content: data.choices[0].message.content 
    };
  } catch (error) {
    console.error('Groq client error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error. Please check your internet connection.' };
    }
    
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

// Fallback responses for when API is unavailable
export const FALLBACK_RESPONSES: Record<string, string> = {
  'portfolio_summary': `Based on your current portfolio:

**Key Metrics:**
- Total AUM: ₹28.15 Cr across 15 active FDs
- Weighted Average Rate: 7.42%
- Monthly Interest Accrual: ~₹17.4 Lakhs

**Top Recommendations:**
1. **Rate Optimization**: 3 FDs maturing in next 30 days — consider negotiating with HDFC Bank for better rates (currently offering 7.75% for 1-year)
2. **Concentration Risk**: 35% exposure to HDFC Bank — consider diversifying to Axis or ICICI
3. **Cash Flow**: ₹4.2 Cr maturing in March — plan rollover strategy now

Would you like me to analyze specific aspects of your portfolio?`,

  'maturity_analysis': `**Upcoming Maturities (Next 90 Days):**

| FD ID | Bank | Amount | Maturity Date | Action |
|-------|------|--------|---------------|--------|
| FD-2026-004 | Axis Bank | ₹2.5 Cr | 28 Feb 2026 | Review rollover |
| FD-2026-008 | SBI | ₹1.8 Cr | 05 Mar 2026 | Action required |
| FD-2026-012 | HDFC | ₹3.2 Cr | 18 Mar 2026 | Negotiate rate |

**Total Maturing**: ₹7.5 Cr

**Suggested Actions:**
- Contact Axis Bank 15 days before maturity for rate negotiation
- Consider splitting SBI FD into 2 tranches for laddering
- HDFC renewal: Current rate 7.35%, market rate 7.65% — negotiate up`,

  'rate_comparison': `**Current Market FD Rates (1-Year Tenor):**

| Bank | General | Senior Citizen | Min Amount |
|------|---------|----------------|------------|
| HDFC Bank | 7.25% | 7.75% | ₹10,000 |
| ICICI Bank | 7.20% | 7.70% | ₹10,000 |
| Axis Bank | 7.30% | 7.80% | ₹5,000 |
| SBI | 6.80% | 7.30% | ₹1,000 |
| IDFC First | 7.75% | 8.25% | ₹10,000 |
| Kotak Mahindra | 7.10% | 7.60% | ₹5,000 |

**Your Current Average**: 7.42%
**Market Best**: 7.75% (IDFC First)

**Opportunity**: Negotiate with your relationship managers for rates closer to 7.60-7.70%`,

  'tds_explained': `**TDS on FD Interest (India):**

**Thresholds:**
- ₹40,000/year for general taxpayers
- ₹50,000/year for senior citizens

**TDS Rates:**
- 10% if PAN provided
- 20% if PAN not provided

**Your Portfolio TDS Status:**
- Estimated Annual Interest: ₹2.08 Cr
- TDS Applicable: ₹20.8 Lakhs (10%)
- Forms 15G/15H: 3 active, 2 expiring this month

**Action Required:**
- Submit renewed 15G forms before month-end to avoid TDS
- Review TDS credits in Form 26AS quarterly
- File refund claim if TDS exceeds actual tax liability`,

  'accrual_explanation': `**Interest Accrual in Treasury:**

Accrual accounting recognizes interest income as it earns, not when received.

**Monthly Accrual Formula:**
\`
Daily Interest = Principal × Rate / 365
Monthly Accrual = Daily Interest × Days in Month
\`

**Example (₹1 Cr @ 7.5%):**
- Daily: ₹1,00,00,000 × 7.5% / 365 = ₹2,055
- February (28 days): ₹57,534
- March (31 days): ₹63,699

**Your February Accruals:**
- Total Accrued: ₹12,45,678
- Payable: 5 banks
- TDS Component: ₹1,24,568

**Journal Entry:**
- Dr. Interest Receivable: ₹12,45,678
- Cr. Interest Income: ₹11,21,110
- Cr. TDS Receivable: ₹1,24,568`,

  'default': `I apologize, but I'm unable to connect to my knowledge base at the moment. However, I can help you with:

- Portfolio analysis and summaries
- FD maturity planning
- Rate comparisons across banks
- TDS and tax implications
- Interest accrual calculations
- Cash flow projections

Please try your question again, or ask about one of these topics for a detailed response.`,
};

export function getFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('portfolio') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
    return FALLBACK_RESPONSES.portfolio_summary;
  }
  if (lowerQuery.includes('maturity') || lowerQuery.includes('maturing')) {
    return FALLBACK_RESPONSES.maturity_analysis;
  }
  if (lowerQuery.includes('rate') || lowerQuery.includes('comparison') || lowerQuery.includes('bank rate')) {
    return FALLBACK_RESPONSES.rate_comparison;
  }
  if (lowerQuery.includes('tds') || lowerQuery.includes('tax')) {
    return FALLBACK_RESPONSES.tds_explained;
  }
  if (lowerQuery.includes('accrual') || lowerQuery.includes('accrue')) {
    return FALLBACK_RESPONSES.accrual_explanation;
  }
  
  return FALLBACK_RESPONSES.default;
}
