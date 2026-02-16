import {
  ACMClient,
  RequestCertificateCommand,
  DescribeCertificateCommand,
  DeleteCertificateCommand,
  ListCertificatesCommand,
  type CertificateDetail,
  type DomainValidation,
} from '@aws-sdk/client-acm';

export interface AcmClientConfig {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface RequestCertificateOptions {
  domainName: string;
  subjectAlternativeNames?: string[];
  validationMethod?: 'DNS' | 'EMAIL';
  tags?: Array<{ Key: string; Value: string }>;
}

export interface CertificateStatus {
  status: string;
  domainValidationOptions?: DomainValidation[];
}

export class AcmDao {
  private client: ACMClient;

  constructor(config?: AcmClientConfig) {
    // ACM for CloudFront must be in us-east-1
    const region = config?.region || 'us-east-1';

    const clientConfig: any = { region };

    if (config?.credentials) {
      clientConfig.credentials = config.credentials;
    } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.client = new ACMClient(clientConfig);
  }

  /**
   * Request a new SSL/TLS certificate
   */
  async requestCertificate(options: RequestCertificateOptions): Promise<{ certificateArn: string }> {
    const response = await this.client.send(new RequestCertificateCommand({
      DomainName: options.domainName,
      ValidationMethod: options.validationMethod || 'DNS',
      SubjectAlternativeNames: options.subjectAlternativeNames,
      Tags: options.tags,
    }));

    return {
      certificateArn: response.CertificateArn || '',
    };
  }

  /**
   * Get certificate details including validation records
   */
  async describeCertificate(certificateArn: string): Promise<CertificateDetail> {
    const response = await this.client.send(new DescribeCertificateCommand({
      CertificateArn: certificateArn,
    }));

    if (!response.Certificate) {
      throw new Error(`Certificate ${certificateArn} not found`);
    }

    return response.Certificate;
  }

  /**
   * Get certificate status
   */
  async getCertificateStatus(certificateArn: string): Promise<CertificateStatus> {
    const certificate = await this.describeCertificate(certificateArn);

    return {
      status: certificate.Status || 'UNKNOWN',
      domainValidationOptions: certificate.DomainValidationOptions,
    };
  }

  /**
   * Delete a certificate
   */
  async deleteCertificate(certificateArn: string): Promise<void> {
    await this.client.send(new DeleteCertificateCommand({
      CertificateArn: certificateArn,
    }));
  }

  /**
   * Wait for certificate to be issued (polls status)
   */
  async waitForCertificateValidation(
    certificateArn: string,
    maxAttempts: number = 60,
    delayMs: number = 5000
  ): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getCertificateStatus(certificateArn);

      if (status.status === 'ISSUED') {
        return true;
      }

      if (status.status === 'FAILED' || status.status === 'VALIDATION_TIMED_OUT') {
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    return false;
  }

  /**
   * List all certificates
   */
  async listCertificates(): Promise<Array<{ CertificateArn?: string; DomainName?: string }>> {
    const response = await this.client.send(new ListCertificatesCommand({}));
    return response.CertificateSummaryList || [];
  }
}
